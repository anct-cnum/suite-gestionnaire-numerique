import { Prisma } from '@prisma/client'

import { Membre, membreInclude, toMembres } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { alphaAsc } from '@/shared/lang'
import { FeuilleDeRouteReadModel, MembreReadModel, TypeDeComite, UneGouvernanceLoader, UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'

export class PrismaGouvernanceLoader implements UneGouvernanceLoader {
  readonly #dataResource = prisma.gouvernanceRecord

  async get(codeDepartement: string): Promise<UneGouvernanceReadModel> {
    const gouvernanceRecord = await this.#dataResource.findUniqueOrThrow({
      include,
      where: {
        departementCode: codeDepartement,
      },
    })

    return transform(gouvernanceRecord)
  }
}

function transform(
  gouvernanceRecord: Prisma.GouvernanceRecordGetPayload<{ include: typeof include }>
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
  const feuillesDeRoute = gouvernanceRecord.feuillesDeRoute.map((feuilleDeRoute) => ({
    beneficiairesSubvention: beneficiairesSubvention(
      feuilleDeRoute.action,
      enveloppe => !isEnveloppeDeFormation(enveloppe)
    ),
    beneficiairesSubventionFormation: beneficiairesSubvention(
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
    ...feuilleDeRoute.action.reduce<CumulMontants>(cumulerMontants, {
      budgetGlobal: 0,
      montantSubventionAccordee: 0,
      montantSubventionDemandee: 0,
      montantSubventionFormationAccordee: 0,
    }),
    nom: feuilleDeRoute.nom,
    porteur: feuilleDeRoute.relationMembre
      ? toMembres([feuilleDeRoute.relationMembre]).map(fromMembre)[0]
      : undefined,
    totalActions: feuilleDeRoute.action.length,
    uid: String(feuilleDeRoute.id),
  }))
  return {
    comites,
    departement: gouvernanceRecord.relationDepartement.nom,
    feuillesDeRoute,
    noteDeContexte,
    notePrivee,
    peutVoirNotePrivee: false,
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
            contactTechnique: membre.contactTechnique ?? undefined,
            feuillesDeRoute: feuillesDeRoutePortees.map(({ nom, uid }) => ({ nom, uid })),
            links: {},
            nom: membre.nom,
            roles: membre.roles,
            ...feuillesDeRoutePortees.reduce(calculerTotaux, {
              totalMontantsSubventionsAccordees: 0,
              totalMontantsSubventionsFormationAccordees: 0,
            }),
            type: membre.type ?? '',
          }
        }),
      total: membres.filter(({ statut }) => statut === 'confirme').length,
    },
    uid: gouvernanceRecord.departementCode,
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

function isCoporteur(membre: Membre): boolean {
  return membre.roles.includes('coporteur')
}

function fromMembre(membre: Membre): MembreReadModel {
  return {
    nom: membre.nom,
    roles: membre.roles,
    type: membre.type ?? '',
    uid: membre.id,
  }
}

function cumulerMontants(
  cumul: CumulMontants,
  action: Prisma.GouvernanceRecordGetPayload<{
    include: typeof include
  }>['feuillesDeRoute'][number]['action'][number]
): CumulMontants {
  const demandeDeSubvention = action.demandesDeSubvention[0] as typeof action['demandesDeSubvention'][number] | undefined
  const { subventionDemandee, subventionEtp, subventionPrestation } = demandeDeSubvention
    ?? { subventionDemandee: 0, subventionEtp: 0, subventionPrestation: 0 }
  const subventionAccordee = Number(subventionPrestation) + Number(subventionEtp)
  return {
    ...cumul,
    budgetGlobal: cumul.budgetGlobal + action.budgetGlobal,
    ...demandeDeSubvention && isEnveloppeDeFormation(demandeDeSubvention.enveloppe)
      ? { montantSubventionFormationAccordee: cumul.montantSubventionFormationAccordee + subventionAccordee }
      : { montantSubventionAccordee: cumul.montantSubventionAccordee + subventionAccordee },
    montantSubventionDemandee: cumul.montantSubventionDemandee + Number(subventionDemandee),
  }
}

function isEnveloppeDeFormation(enveloppe: Prisma.EnveloppeFinancementRecordGetPayload<null>): boolean {
  return /formation/i.test(enveloppe.libelle)
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

type CumulMontants = Readonly<{
  budgetGlobal: number
  montantSubventionAccordee: number
  montantSubventionDemandee: number
  montantSubventionFormationAccordee: number
}>

type Totaux = Readonly<{
  totalMontantsSubventionsAccordees: number
  totalMontantsSubventionsFormationAccordees: number
}>
