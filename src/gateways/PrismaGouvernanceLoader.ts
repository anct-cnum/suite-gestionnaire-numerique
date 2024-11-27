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
      },
      {
        dateProchainComite: new Date('2024-08-01'),
        nom: 'Comité stratégique 1',
        periodicite: 'Trimestriel',
      },
    ],
    departement: gouvernanceRecord.nom,
    feuillesDeRoute: [
      {
        budgetGlobal: 145000,
        nom: 'Feuille de route inclusion 1',
        totalActions: 3,
      },
      {
        budgetGlobal: 88030,
        nom: 'Feuille de route inclusion 2',
        totalActions: 1,
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
  }
}
