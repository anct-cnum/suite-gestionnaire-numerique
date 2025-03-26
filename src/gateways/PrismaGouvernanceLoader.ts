import { Prisma } from '@prisma/client'

import { Membre, membreInclude, toMembre, toMembres } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { alphaAsc } from '@/shared/lang'
import { FeuilleDeRouteReadModel, MembreReadModel, TypeDeComite, UneGouvernanceLoader, UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'

export class PrismaGouvernanceLoader implements UneGouvernanceLoader {
  readonly #dataResource = prisma.gouvernanceRecord

  async get(codeDepartement: string): Promise<UneGouvernanceReadModel> {
    const gouvernanceRecord = await this.#dataResource.findUniqueOrThrow({
      include: include(codeDepartement),
      where: {
        departementCode: codeDepartement,
      },
    })

    return transform(gouvernanceRecord)
  }
}

function transform(
  gouvernanceRecord: Prisma.GouvernanceRecordGetPayload<{ include: ReturnType<typeof include> }>
): UneGouvernanceReadModel {
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
  const membres = toMembres(gouvernanceRecord.membres)
  return {
    comites,
    departement: gouvernanceRecord.relationDepartement.nom,
    feuillesDeRoute: gouvernanceRecord.feuillesDeRoute.map((feuilleDeRoute) => ({
      beneficiairesSubvention: feuilleDeRoute.action
        .values()
        .map(({ demandesDeSubvention }) => demandesDeSubvention[0])
        .filter(Boolean)
        .flatMap(({ beneficiaire }) => beneficiaire)
        .map(({ membre }) => fromMembre(toMembre(membre)))
        .toArray()
        .toSorted(alphaAsc('nom')),
      beneficiairesSubventionFormation: [],
      ...feuilleDeRoute.action.reduce<CumulMontants>(cumulerMontants, {
        budgetGlobal: 0,
        montantSubventionAccorde: 0,
        montantSubventionDemande: 0,
        montantSubventionFormationAccorde: 0,
      }),
      nom: feuilleDeRoute.nom,
      porteur: feuilleDeRoute.relationMembre
        ? fromMembre(toMembre(feuilleDeRoute.relationMembre))
        : undefined,
      totalActions: feuilleDeRoute.action.length,
      uid: String(feuilleDeRoute.id),
    })),
    noteDeContexte,
    notePrivee,
    peutVoirNotePrivee: false,
    syntheseMembres: {
      candidats: membres.filter(({ statut }) => statut === 'candidat').length,
      coporteurs: membres
        .filter(isCoporteur)
        .toSorted(alphaAsc('nom'))
        .map((membre) => ({
          contactReferent: {
            denomination: 'Contact référent' as const,
            mailContact: membre.contactReferent.email,
            nom: membre.contactReferent.nom,
            poste: membre.contactReferent.fonction,
            prenom: membre.contactReferent.prenom,
          },
          contactTechnique: membre.contactTechnique ?? undefined,
          feuillesDeRoute: gouvernanceRecord.membres
            .flatMap(({ feuillesDeRoute }) => feuillesDeRoute)
            .filter(({ porteurId }) => membre.id === porteurId)
            .map(feuilleDeRoute => ({
              montantSubventionAccorde: 0,
              montantSubventionFormationAccorde: 0,
              nom: feuilleDeRoute.nom,
            })),
          links: {},
          nom: membre.nom,
          roles: membre.roles,
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,
          type: membre.type ?? '',
        })),
      total: membres.filter(({ statut }) => statut === 'confirme').length,
    },
    uid: gouvernanceRecord.departementCode,
  }
}

function isCoporteur(membre: Membre): boolean {
  return membre.roles.includes('coporteur')
}

function fromMembre(membre: Membre): MembreReadModel {
  return {
    nom: membre.nom,
    roles: membre.roles,
    type: membre.type ?? '',
  }
}

function cumulerMontants(
  cumul: CumulMontants,
  action: Prisma.GouvernanceRecordGetPayload<{
    include: ReturnType<typeof include>
  }>['feuillesDeRoute'][number]['action'][number]
): CumulMontants {
  const demandeDeSubvention = action.demandesDeSubvention[0] as typeof action['demandesDeSubvention'][number] | undefined
  const { subventionDemandee, subventionEtp, subventionPrestation } = demandeDeSubvention
    ?? { subventionDemandee: 0, subventionEtp: 0, subventionPrestation: 0 }
  const subventionAccordee = Number(subventionPrestation) + Number(subventionEtp)
  return {
    ...cumul,
    budgetGlobal: cumul.budgetGlobal + action.budgetGlobal,
    ...demandeDeSubvention && /formation/i.test(demandeDeSubvention.enveloppe.libelle)
      ? {
        montantSubventionAccorde: cumul.montantSubventionAccorde,
        montantSubventionFormationAccorde: cumul.montantSubventionFormationAccorde + subventionAccordee,
      } : {
        montantSubventionAccorde: cumul.montantSubventionAccorde + subventionAccordee,
        montantSubventionFormationAccorde: cumul.montantSubventionFormationAccorde,
      },
    montantSubventionDemande: cumul.montantSubventionDemande + Number(subventionDemandee),
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function include(codeDepartement: string) {
  return {
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
      include: {
        ...membreInclude,
        feuillesDeRoute: {
          where: {
            gouvernanceDepartementCode: codeDepartement,
          },
        },
      },
    },
    relationDepartement: true,
    relationEditeurNoteDeContexte: true,
    relationEditeurNotePrivee: true,
  }
}

type CumulMontants = Pick<FeuilleDeRouteReadModel, 'budgetGlobal' | 'montantSubventionAccorde' | 'montantSubventionFormationAccorde' | 'montantSubventionDemande'>
