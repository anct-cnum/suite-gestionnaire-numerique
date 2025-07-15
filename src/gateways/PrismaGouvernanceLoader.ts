import { Prisma } from '@prisma/client'

import { isEnveloppeDeFormation } from './shared/Action'
import { isCoporteur, Membre, membreInclude, toMembres } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'
import { alphaAsc } from '@/shared/lang'
import { FeuillesDeRouteReadModel } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'
import { FeuilleDeRouteReadModel, MembreReadModel, TypeDeComite, UneGouvernanceLoader, UneGouvernanceLoaderReadModel } from '@/use-cases/queries/RecupererUneGouvernance'
import { EtablisseurSyntheseGouvernance } from '@/use-cases/services/shared/etablisseur-synthese-gouvernance'

export class PrismaGouvernanceLoader implements UneGouvernanceLoader {
  readonly #dataResource = prisma.gouvernanceRecord
  readonly #etablisseurSynthese: EtablisseurSyntheseGouvernance
  readonly #membreDao = prisma.membreRecord

  constructor(etablisseurSynthese: EtablisseurSyntheseGouvernance) {
    this.#etablisseurSynthese = etablisseurSynthese
  }

  async get(codeDepartement: string): Promise<UneGouvernanceLoaderReadModel> {
    const gouvernanceRecord = await this.#dataResource.findUniqueOrThrow({
      include,
      where: {
        departementCode: codeDepartement,
      },
    })

    const membreConfirmesGouvernance = await this.#membreDao.findMany({
      include: membreInclude,
      where: {
        AND: [
          {
            statut: {
              equals: 'confirme',
            },
          },
          {
            gouvernanceDepartementCode: codeDepartement,
          },
        ],
      },
    })

    return this.#transform(gouvernanceRecord, membreConfirmesGouvernance)
  }

  #transform(
    gouvernanceRecord: Prisma.GouvernanceRecordGetPayload<{ include: typeof include }>,
    membresConfirmesGouvernance: ReadonlyArray<Prisma.MembreRecordGetPayload<{ include: typeof membreInclude }>>
  ): UneGouvernanceLoaderReadModel {
    const noteDeContexte =
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      gouvernanceRecord.noteDeContexte &&
        gouvernanceRecord.relationEditeurNoteDeContexte &&
        gouvernanceRecord.derniereEditionNoteDeContexte
        ? {
          dateDeModification: new Date(gouvernanceRecord.derniereEditionNoteDeContexte),
          nomAuteur: gouvernanceRecord.relationEditeurNoteDeContexte.nom,
          prenomAuteur: gouvernanceRecord.relationEditeurNoteDeContexte.prenom,
          texte: gouvernanceRecord.noteDeContexte,
        } : undefined
    const notePrivee = gouvernanceRecord.notePrivee && gouvernanceRecord.relationEditeurNotePrivee ? {
      dateDEdition: new Date(gouvernanceRecord.notePrivee.derniereEdition),
      nomEditeur: gouvernanceRecord.relationEditeurNotePrivee.nom,
      prenomEditeur: gouvernanceRecord.relationEditeurNotePrivee.prenom,
      texte: gouvernanceRecord.notePrivee.contenu,
    } : undefined
    const comites = gouvernanceRecord.comites.length > 0
      ? gouvernanceRecord.comites.map((comite) => ({
        commentaire: comite.commentaire ?? '',
        date: comite.date ?? undefined,
        derniereEdition: comite.derniereEdition,
        frequence: comite.frequence,
        id: comite.id,
        nomEditeur: comite.relationUtilisateur.nom,
        prenomEditeur: comite.relationUtilisateur.prenom,
        type: comite.type as TypeDeComite,
      }))
      : undefined
    const membres = toMembres(membresConfirmesGouvernance)
    
    const synthese = this.#etablisseurSynthese({
      feuillesDeRoute: gouvernanceRecord.feuillesDeRoute.map(feuilleDeRoute => ({
        actions: feuilleDeRoute.action.map(action => {
          const demandeDeSubvention =
            action.demandesDeSubvention[0] as typeof action.demandesDeSubvention[number] | undefined
          return {
            beneficiaires: beneficiairesSubvention(
              [action],
              enveloppe => !isEnveloppeDeFormation(enveloppe)
            ),
            budgetGlobal: action.budgetGlobal,
            coFinancements: [],
            subvention: demandeDeSubvention ? {
              isFormation: isEnveloppeDeFormation(action.demandesDeSubvention[0].enveloppe),
              montants: {
                prestation: action.demandesDeSubvention[0].subventionPrestation ?? 0,
                ressourcesHumaines: action.demandesDeSubvention[0].subventionEtp ?? 0,
              },
              statut: demandeDeSubvention.statut as StatutSubvention,
            } : undefined,
            uid: String(action.id),
          }
        }),
        uid: String(feuilleDeRoute.id),
      })),
    })
    const feuillesDeRoute = gouvernanceRecord.feuillesDeRoute.map((feuilleDeRoute, index) => {
      return {
        beneficiairesSubvention: beneficiairesSubvention(
          feuilleDeRoute.action,
          enveloppe => !isEnveloppeDeFormation(enveloppe)
        ),
        beneficiairesSubventionAccordee: beneficiairesSubventionAccordee(
          feuilleDeRoute.action,
          enveloppe => !isEnveloppeDeFormation(enveloppe)
        ),
        beneficiairesSubventionFormation: beneficiairesSubvention(
          feuilleDeRoute.action,
          isEnveloppeDeFormation
        ),
        beneficiairesSubventionFormationAccordee: beneficiairesSubventionAccordee(
          feuilleDeRoute.action,
          isEnveloppeDeFormation
        ),
        ...Boolean(feuilleDeRoute.pieceJointe) && {
          pieceJointe: {
            apercu: '',
            emplacement: '',
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            nom: feuilleDeRoute.pieceJointe!,
          },
        },
        budgetGlobal: synthese.feuillesDeRoute[index].budget,
        montantSubventionAccordee: synthese.feuillesDeRoute[index].financemenTotalAccorde,
        montantSubventionDemandee: synthese.feuillesDeRoute[index].financementDemande,
        montantSubventionFormationAccordee: synthese.feuillesDeRoute[index].financementFormationAccorde,
        nom: feuilleDeRoute.nom,
        porteur: feuilleDeRoute.relationMembre
          ? toMembres([feuilleDeRoute.relationMembre]).map(fromMembre)[0]
          : undefined,
        totalActions: feuilleDeRoute.action.length,
        uid: String(feuilleDeRoute.id),
      }
    })
    return {
      comites,
      departement: gouvernanceRecord.relationDepartement.nom,
      feuillesDeRoute,
      noteDeContexte,
      notePrivee,
      porteursPotentielsNouvellesFeuillesDeRouteOuActions: toMembres(membresConfirmesGouvernance)
        .toSorted(alphaAsc('id'))
        .toSorted(alphaAsc('nom'))
        .map(fromMembreAvecRoles),
      syntheseMembres: {
        candidats: membres.filter(({ statut }) => statut === 'candidat').length,
        coporteurs: membres
          .filter(isCoporteur)
          .toSorted(alphaAsc('nom'))
          .map((membre) => {
            const feuillesDeRoutePortees = feuillesDeRoute
              .filter(feuilleDeRoute => feuilleDeRoute.porteur?.uid === membre.id)
            return {
              contactReferent: {
                denomination: 'Contact référent' as const,
                mailContact: membre.contactReferent.email,
                nom: membre.contactReferent.nom,
                poste: membre.contactReferent.fonction,
                prenom: membre.contactReferent.prenom,
              },
              contactTechnique: membre.contactTechnique ? `${membre.contactTechnique.prenom} ${membre.contactTechnique.nom} (${membre.contactTechnique.email})` : undefined,
              feuillesDeRoute: feuillesDeRoutePortees.map(({ nom, uid }) => ({ nom, uid })),
              links: {},
              nom: membre.nom,
              roles: membre.roles,
              ...feuillesDeRoutePortees.reduce(calculerTotaux, {
                totalMontantsSubventionsAccordees: 0,
                totalMontantsSubventionsFormationAccordees: 0,
              }),
              type: membre.type,
              uid: membre.id,
            }
          }),
        total: membres.filter(({ statut }) => statut === 'confirme').length,
      },
      uid: gouvernanceRecord.departementCode,
    }
  }
}

function beneficiairesSubvention(
  actions: Prisma.GouvernanceRecordGetPayload<{ include: typeof include }>['feuillesDeRoute'][number]['action'],
  predicate: (enveloppe: Prisma.EnveloppeFinancementRecordGetPayload<null>) => boolean
): ReadonlyArray<MembreReadModel> {
  return toMembres(
    actions
      .map(({ demandesDeSubvention }) => demandesDeSubvention[0])
      .filter(Boolean)
      .filter(({ enveloppe }) => predicate(enveloppe))
      .flatMap(({ beneficiaire }) => beneficiaire)
      .map(({ membre }) => membre)
  )
    .map(fromMembre)
    .toSorted(alphaAsc('nom'))
}

function beneficiairesSubventionAccordee(
  actions: Prisma.GouvernanceRecordGetPayload<{ include: typeof include }>['feuillesDeRoute'][number]['action'],
  predicate: (enveloppe: Prisma.EnveloppeFinancementRecordGetPayload<null>) => boolean
): ReadonlyArray<MembreReadModel> {
  return toMembres(
    actions
      .map(({ demandesDeSubvention }) => demandesDeSubvention[0])
      .filter(Boolean)
      .filter(({ enveloppe, statut }) => predicate(enveloppe) && 
              (statut as StatutSubvention) === StatutSubvention.ACCEPTEE)
      .flatMap(({ beneficiaire }) => beneficiaire)
      .map(({ membre }) => membre)
  )
    .map(fromMembre)
    .toSorted(alphaAsc('nom'))
}

function fromMembre(membre: Membre): MembreReadModel {
  return {
    nom: membre.nom,
    uid: membre.id,
  }
}

function calculerTotaux(totaux: Totaux, feuilleDeRoute: FeuilleDeRouteReadModel): Totaux {
  return {
    totalMontantsSubventionsAccordees: totaux.totalMontantsSubventionsAccordees
      + feuilleDeRoute.montantSubventionAccordee,
    totalMontantsSubventionsFormationAccordees: totaux.totalMontantsSubventionsFormationAccordees +
      feuilleDeRoute.montantSubventionFormationAccordee,
  }
}

const include = {
  comites: {
    include: {
      relationUtilisateur: true,
    },
  },
  feuillesDeRoute: {
    include: {
      action: {
        include: {
          demandesDeSubvention: {
            include: {
              beneficiaire: {
                include: {
                  membre: {
                    include: membreInclude,
                  },
                },
              },
              enveloppe: true,
            },
          },
        },
      },
      relationMembre: {
        include: membreInclude,
      },
    },
  },
  membres: {
    include: membreInclude,
  },
  relationDepartement: true,
  relationEditeurNoteDeContexte: true,
  relationEditeurNotePrivee: true,
}

function fromMembreAvecRoles(
  { id, nom, roles, type }: Membre
): FeuillesDeRouteReadModel['porteursPotentielsNouvellesFeuillesDeRouteOuActions'][number] {
  return { nom, roles, type, uid: id }
}

type Totaux = Readonly<{
  totalMontantsSubventionsAccordees: number
  totalMontantsSubventionsFormationAccordees: number
}>
