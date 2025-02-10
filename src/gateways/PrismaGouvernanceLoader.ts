import { Prisma } from '@prisma/client'

import { Membre, sortMembres, toMembres } from './shared/MembresGouvernance'
import { CoporteurDetailReadModel, TypeDeComite, UneGouvernanceLoader, UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'

export class PrismaGouvernanceLoader implements UneGouvernanceLoader {
  readonly #dataResource: Prisma.GouvernanceRecordDelegate

  constructor(dataResource: Prisma.GouvernanceRecordDelegate) {
    this.#dataResource = dataResource
  }

  async get(codeDepartement: string): Promise<UneGouvernanceReadModel> {
    const gouvernanceRecord = await this.#dataResource.findFirst({
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

    if (gouvernanceRecord === null) {
      throw new Error('Le département n’existe pas')
    }

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
      nomEditeur: comite.relationUtilisateur?.nom ?? '~',
      prenomEditeur: comite.relationUtilisateur?.prenom ?? '~',
      type: comite.type as TypeDeComite,
    }))
    : undefined

  return {
    comites,
    coporteurs: toMembres(gouvernanceRecord.membres)
      .filter(isCoporteur)
      .toSorted(sortMembres)
      .map((membre) => ({
        ...membre,
        ...bouchonCoporteur,
        totalMontantSubventionAccorde: NaN,
        totalMontantSubventionFormationAccorde: NaN,
      } as CoporteurDetailReadModel)),
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
    })),
    noteDeContexte,
    notePrivee,
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
      }
    }
  }
}>

function isCoporteur(membre: Membre): boolean {
  return membre.roles.includes('coporteur')
}

const bouchonCoporteur: Partial<CoporteurDetailReadModel> = {
  contactReferent: {
    denomination: 'Contact politique de la collectivité',
    mailContact: 'julien.deschamps@example.com',
    nom: 'Henrich',
    poste: 'chargé de mission',
    prenom: 'Laetitia',
  },
  contactTechnique: 'Simon.lagrange@example.com',
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
  links: {},
  telephone: '+33 4 45 00 45 00',
}
