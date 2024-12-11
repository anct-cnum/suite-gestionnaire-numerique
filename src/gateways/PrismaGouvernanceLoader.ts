import { DepartementRecord, PrismaClient } from '@prisma/client'

import { UneGouvernanceReadModel, UneGouvernanceReadModelLoader } from '@/use-cases/queries/RecupererUneGouvernance'

export class PrismaGouvernanceLoader implements UneGouvernanceReadModelLoader {
  readonly #prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma
  }

  async find(codeDepartement: string): Promise<UneGouvernanceReadModel | null> {
    const gouvernanceRecord = await this.#prisma.departementRecord.findUnique({
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
        actions: [
          {
            beneficiaires: [{ nom: 'Structure 1', roles: ['Porteur'], type: 'Structure' }, { nom: 'Structure 2', roles: ['Porteur'], type: 'Structure' }],
            besoin: 'EtablirUnDiagnosticTerritorial',
            budgetGlobal: 50_000,
            demandesDeCofinancement: [
              {
                emetteur: { nom: 'Région Auvergne-Rhône-Alpes', roles: ['Financeur'], type: 'Collectivité' },
                montantDemande: 15_000,
              },
            ],
            demandesDeSubvention: [
              {
                montantAccorde: 35_000,
                montantDemande: 40_000,
                type: 'FSE',
              },
            ],
            nom: 'demandeDeSubventionFormation',
            statut: 'envoyee',
          },
          {
            beneficiaires: [{ nom: 'Structure 1', roles: ['Porteur'], type: 'Structure' }, { nom: 'Structure 2', roles: ['Porteur'], type: 'Structure' }],
            besoin: 'CoConstruireLaFeuilleDeRoute',
            budgetGlobal: 50_000,
            demandesDeCofinancement: [
              {
                emetteur: { nom: 'Région Auvergne-Rhône-Alpes', roles: ['Financeur'], type: 'Collectivité' },
                montantDemande: 15_000,
              },
            ],
            demandesDeSubvention: [
              {
                montantAccorde: 35_000,
                montantDemande: 40_000,
                type: 'FSE',
              },
            ],
            nom: 'demandeDeSubventionFormation',
            statut: 'validee',
          },
          {
            beneficiaires: [{ nom: 'Structure 1', roles: ['Porteur'], type: 'Structure' }, { nom: 'Structure 2', roles: ['Porteur'], type: 'Structure' }],
            besoin: 'RedigerLaFeuilleDeRoute',
            budgetGlobal: 45_000,
            demandesDeCofinancement: [
              {
                emetteur: { nom: 'Région Auvergne-Rhône-Alpes', roles: ['Financeur'], type: 'Collectivité' },
                montantDemande: 15_000,
              },
            ],
            demandesDeSubvention: [
              {
                montantAccorde: 30_000,
                montantDemande: 35_000,
                type: 'FSE',
              },
            ],
            nom: 'demandeDeSubvention',
            statut: 'rejetee',
          },
        ],
        beneficiaires: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
        beneficiairesSubventionFormation: [{ nom: 'Préfecture du Rhône', roles: ['Porteur'], type: 'Structure' }, { nom: 'CC des Monts du Lyonnais', roles: ['Porteur'], type: 'Structure' }],
        budgetGlobal: 145_000,
        montantSubventionAccorde: 5_000,
        montantSubventionDemande: 40_000,
        montantSubventionFormationAccorde: 5_000,
        montantSubventionFormationDemande: 40_000,
        nom: 'Feuille de route inclusion 1',
        porteur: { nom: 'Préfecture du Rhône', roles: ['Co-orteur'], type: 'Administration' },
        totalActions: 3,
      },
    ],
    membres: [
      {
        nom: 'Préfecture du Rhône',
        roles: ['Co-porteur'],
        type: 'Administration',
      },
      {
        nom: 'Département du Rhône',
        roles: ['Co-porteur', 'Financeur'],
        type: 'Collectivité',
      },
      {
        nom: 'CC des Monts du Lyonnais',
        roles: ['Co-porteur', 'Financeur'],
        type: 'Collectivité',
      },
    ],
    noteDeContexte: {
      dateDeModification: new Date('2024-11-23'),
      nomAuteur: 'Deschamps',
      prenomAuteur: 'Jean',
      texte: '<strong>Note privée (interne)</strong><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p><p>lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. Gravida eget egestas odio sit aliquam ultricies accumsan. Felis feugiat nisl sem amet feugiat.</p>',
    },
    uid: '123456',
  }
}
