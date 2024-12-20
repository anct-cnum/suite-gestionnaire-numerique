import { Prisma } from '@prisma/client'

import { TypeDeComite, UneGouvernanceReadModel, UneGouvernanceReadModelLoader } from '@/use-cases/queries/RecupererUneGouvernance'

type GouvernanceWithNoteDeContexte = Prisma.GouvernanceRecordGetPayload<{
  include: {
    noteDeContexte: {
      select: {
        id: true
        gouvernanceId: true
        derniereEdition: true
        relationUtilisateur: true
        contenu: true
      }
    }
    comites: true
    relationDepartement: {
      select: {
        code: true
        nom: true
      }
    }
  }
}>

export class PrismaGouvernanceLoader implements UneGouvernanceReadModelLoader {
  readonly #dataResource: Prisma.GouvernanceRecordDelegate

  constructor(dataResource: Prisma.GouvernanceRecordDelegate) {
    this.#dataResource = dataResource
  }

  async find(codeDepartement: string): Promise<UneGouvernanceReadModel | null> {
    const gouvernanceRecord = await this.#dataResource.findFirst({
      include: {
        comites: true,
        noteDeContexte: {
          include: {
            relationUtilisateur: true,
          },
        },
        relationDepartement: true,
      },
      where: {
        departementCode: codeDepartement,
      },
    })
    if (gouvernanceRecord === null) {
      return null
    }

    return transform(gouvernanceRecord)
  }
}

function transform(gouvernanceRecord: GouvernanceWithNoteDeContexte): UneGouvernanceReadModel {
  const noteDeContexte = gouvernanceRecord.noteDeContexte?.derniereEdition ? {
    dateDeModification: gouvernanceRecord.noteDeContexte.derniereEdition,
    nomAuteur: gouvernanceRecord.noteDeContexte.relationUtilisateur.nom,
    prenomAuteur: gouvernanceRecord.noteDeContexte.relationUtilisateur.prenom,
    texte: gouvernanceRecord.noteDeContexte.contenu,
  } : undefined
  const comites = gouvernanceRecord.comites.length > 0
    ? gouvernanceRecord.comites.map((comite) => ({
      commentaire: comite.commentaire ?? '',
      dateProchainComite: comite.dateProchainComite ?? undefined,
      nom: comite.nom ?? '',
      periodicite: comite.frequence,
      type: comite.type as TypeDeComite,
    }))
    : undefined
  return {
    comites,
    departement: gouvernanceRecord.relationDepartement.nom,
    feuillesDeRoute: [
      {
        beneficiairesSubvention: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
        beneficiairesSubventionFormation: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
        budgetGlobal: 145_000,
        montantSubventionAccorde: 5_000,
        montantSubventionDemande: 40_000,
        montantSubventionFormationAccorde: 5_000,
        nom: 'Feuille de route inclusion 1',
        porteur: { nom: 'Préfecture du Rhône', roles: ['Co-porteur'], type: 'Administration' },
        totalActions: 3,
      },
      {
        beneficiairesSubvention: [],
        beneficiairesSubventionFormation: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
        budgetGlobal: 145_000,
        montantSubventionAccorde: 5_000,
        montantSubventionDemande: 40_000,
        montantSubventionFormationAccorde: 5_000,
        nom: 'Feuille de route inclusion 2',
        porteur: { nom: 'Préfecture du Rhône', roles: ['Co-porteur'], type: 'Administration' },
        totalActions: 2,
      },
    ],
    membres: [
      {
        contactReferent: {
          mailContact: 'julien.deschamps@rhones.gouv.fr',
          nom: 'Henrich',
          poste: 'chargé de mission',
          prenom: 'Laetitia',
        },
        contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
        feuillesDeRoute: [
          { nom: 'Feuille de route inclusion' },
          { nom: 'Feuille de route numérique du Rhône' },
        ],
        nom: 'Préfecture du Rhône',
        roles: ['Co-porteur'],
        telephone: '+33 4 45 00 45 00',
        type: 'Administration',
        typologieMembre: 'Préfecture départementale',
      },
      {
        contactReferent: {
          mailContact: 'jean.dupont@rhones.gouv.fr',
          nom: 'Jean',
          poste: 'chargé de mission',
          prenom: 'Dupont',
        },
        contactTechnique: 'Simone.lagrange@rhones.gouv.fr',
        feuillesDeRoute: [{ nom: 'Feuille de route inclusion 1' }],
        nom: 'Département du Rhône',
        roles: ['Co-porteur', 'Financeur'],
        telephone: '+33 4 45 00 45 01',
        type: 'Collectivité',
        typologieMembre: 'Collectivité, EPCI',
      },
      {
        contactReferent: {
          mailContact: 'coco.dupont@rhones.gouv.fr',
          nom: 'Coco',
          poste: 'chargé de mission',
          prenom: 'Dupont',
        },
        contactTechnique: 'coco.dupont@rhones.gouv.fr',
        feuillesDeRoute: [],
        nom: 'CC des Monts du Lyonnais',
        roles: ['Co-porteur', 'Financeur'],
        telephone: '',
        type: 'Collectivité',
        typologieMembre: 'Collectivité, EPCI',
      },
    ],
    noteDeContexte,
    uid: '123456',
  }
}
