import { Prisma } from '@prisma/client'

import { Membre, toMembres } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { alphaAsc } from '@/shared/lang'
import { CoporteurDetailReadModel, TypeDeComite, UneGouvernanceLoader, UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'

export class PrismaGouvernanceLoader implements UneGouvernanceLoader {
  readonly #dataResource = prisma.gouvernanceRecord

  async get(codeDepartement: string): Promise<UneGouvernanceReadModel> {
    const gouvernanceRecord = await this.#dataResource.findUniqueOrThrow({
      include: {
        comites: {
          include: {
            relationUtilisateur: true,
          },
        },
        feuillesDeRoute: true,
        membres: {
          include: {
            membresGouvernanceCommune: true,
            membresGouvernanceDepartement: {
              include: {
                relationDepartement: true,
              },
            },
            membresGouvernanceEpci: true,
            membresGouvernanceSgar: {
              include: {
                relationSgar: true,
              },
            },
            membresGouvernanceStructure: true,
            relationContact: true,
          },
        },
        relationDepartement: true,
        relationEditeurNoteDeContexte: true,
        relationEditeurNotePrivee: true,
      },
      where: {
        departementCode: codeDepartement,
      },
    })

    return transform(gouvernanceRecord)
  }
}

function transform(gouvernanceRecord: GouvernanceRecord): UneGouvernanceReadModel {
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
      beneficiairesSubvention: [
        {
          nom: 'Préfecture du Rhône',
          roles: ['coporteur'],
          type: 'Structure',
        },
        {
          nom: 'CC des Monts du Lyonnais',
          roles: ['coporteur'],
          type: 'Structure',
        },
      ],
      beneficiairesSubventionFormation: [
        {
          nom: 'Préfecture du Rhône',
          roles: ['coporteur'],
          type: 'Structure',
        },
        {
          nom: 'CC des Monts du Lyonnais',
          roles: ['coporteur'],
          type: 'Structure',
        },
      ],
      budgetGlobal: 145_000,
      montantSubventionAccorde: 5_000,
      montantSubventionDemande: 40_000,
      montantSubventionFormationAccorde: 5_000,
      nom: feuilleDeRoute.nom,
      porteur: { nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Administration' },
      totalActions: 3,
      uid: String(feuilleDeRoute.id),
    })),
    noteDeContexte,
    notePrivee,
    syntheseMembres: {
      candidats: membres.filter(({ statut }) => statut === 'candidat').length,
      coporteurs: membres
        .filter(isCoporteur)
        .toSorted(alphaAsc('nom'))
        .map((membre) => ({
          contactReferent: {
            denomination: 'Contact référent',
            mailContact: membre.contactReferent.email,
            nom: membre.contactReferent.nom,
            poste: membre.contactReferent.fonction,
            prenom: membre.contactReferent.prenom,
          },
          contactTechnique: membre.contactTechnique ?? undefined,
          links: {},
          nom: membre.nom,
          roles: membre.roles,
          totalMontantSubventionAccorde: NaN,
          totalMontantSubventionFormationAccorde: NaN,
          type: membre.type ?? '',
          ...bouchonCoporteur,
        })),
      total: membres.filter(({ statut }) => statut === 'confirme').length,
    },
    uid: gouvernanceRecord.departementCode,
  }
}

type GouvernanceRecord = Prisma.GouvernanceRecordGetPayload<{
  include: {
    comites: {
      include: {
        relationUtilisateur: true
      }
    }
    relationDepartement: {
      select: {
        code: true
        nom: true
      }
    }
    relationEditeurNotePrivee: true
    relationEditeurNoteDeContexte: true
    feuillesDeRoute: true
    membres: {
      include: {
        membresGouvernanceCommune: true
        membresGouvernanceDepartement: {
          include: {
            relationDepartement: true
          }
        }
        membresGouvernanceEpci: true
        membresGouvernanceSgar: {
          include: {
            relationSgar: true
          }
        }
        membresGouvernanceStructure: true
        relationContact: true
      }
    }
  }
}>

function isCoporteur(membre: Membre): boolean {
  return membre.roles.includes('coporteur')
}

const bouchonCoporteur: Pick<CoporteurDetailReadModel, 'feuillesDeRoute' | 'telephone'> = {
  feuillesDeRoute: [
    {
      montantSubventionAccorde: 5_000,
      montantSubventionFormationAccorde: 5_000,
      nom: 'Feuille de route inclusion',
    },
    {
      montantSubventionAccorde: 5_000,
      montantSubventionFormationAccorde: 5_000,
      nom: 'Feuille de route numérique du Rhône',
    },
  ],
  telephone: '+33 4 45 00 45 00',
}
