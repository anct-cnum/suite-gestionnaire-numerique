import { DepartementRecord, Prisma } from '@prisma/client'

import {
  UneGouvernanceReadModel,
  UneGouvernanceReadModelLoader,
} from '@/use-cases/queries/RecupererUneGouvernance'

export class PrismaGouvernanceLoader implements UneGouvernanceReadModelLoader {
  readonly #dataResource: Prisma.DepartementRecordDelegate

  constructor(dataResource: Prisma.DepartementRecordDelegate) {
    this.#dataResource = dataResource
  }

  async find(codeDepartement: string): Promise<UneGouvernanceReadModel | null> {
    const gouvernanceRecord = await this.#dataResource.findUnique({
      where: {
        code: codeDepartement,
      },
    })

    if (gouvernanceRecord === null) {
      return null
    }

    return transform(gouvernanceRecord)
  }
}

function transform(gouvernanceRecord: DepartementRecord): UneGouvernanceReadModel {
  return {
    comites: [
      {
        dateProchainComite: new Date('2024-09-06'),
        nom: 'Comité stratégique 2',
        periodicite: 'Semestriel',
        type: 'stratégique',
      },
      {
        dateProchainComite: new Date('2024-08-01'),
        nom: 'Comité stratégique 1',
        periodicite: 'Trimestriel',
        type: 'technique',
      },
    ],
    departement: gouvernanceRecord.nom,
    feuillesDeRoute: [
      {
        beneficiairesSubvention: [
          { nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' },
          { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' },
        ],
        beneficiairesSubventionFormation: [
          { nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' },
          { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' },
        ],
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
        beneficiairesSubventionFormation: [
          { nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' },
          { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' },
        ],
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
        nom: 'Préfecture du Rhône',
        roles: ['Co-porteur'],
        telephone: '+33 4 45 00 45 00',
        type: 'Administration',
        typologieMembre: 'Préfecture départementale',
      },
      {
        contactReferent: {
          mailContact: 'didier.durand@exemple.com',
          nom: 'Didier',
          poste: 'chargé de mission',
          prenom: 'Durant',
        },
        contactTechnique: 'Simone.lagrange@rhones.gouv.fr',
        feuillesDeRoute: [
          {
            montantSubventionAccorde: 30_000,
            montantSubventionFormationAccorde: 20_000,
            nom: 'Feuille de route inclusion',
          },
        ],
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
    noteDeContexte: {
      dateDeModification: new Date('2024-11-23'),
      nomAuteur: 'Deschamps',
      prenomAuteur: 'Jean',
      texte:
        '<STRONG class="test">Note privée (interne)</STRONG><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p>',
    },
    uid: '123456',
  }
}
