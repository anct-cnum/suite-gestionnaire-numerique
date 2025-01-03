import { Prisma } from '@prisma/client'
import { console } from 'inspector'

import { UneGouvernanceReadModel, UneGouvernanceReadModelLoader } from '@/use-cases/queries/RecupererUneGouvernance'

type GouvernanceWithNoteDeContexte = Prisma.GouvernanceRecordGetPayload<{
  include: {
    noteDeContexte: {
      select: {
        id: true
        gouvernanceId: true
        derniereEdition: true
        editeurId: true
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
        noteDeContexte: true,
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
  console.log('gouvernanceRecord', gouvernanceRecord)
  return {
    comites: gouvernanceRecord.comites.map((comite) => ({
      commentaire: comite.commentaire ?? '',
      dateProchainComite: comite.dateProchainComite ?? new Date(),
      nom: comite.nom ?? '',
      periodicite: comite.frequence,
      type: comite.type as 'stratégique' | 'technique',
    })),
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
        porteur: { nom: 'Préfecture du Rhône', roles: ['Co-orteur'], type: 'Administration' },
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
        porteur: { nom: 'Préfecture du Rhône', roles: ['Co-orteur'], type: 'Administration' },
        totalActions: 2,
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
      dateDeModification: gouvernanceRecord.noteDeContexte?.derniereEdition ?? new Date(),
      nomAuteur: 'Deschamps',
      prenomAuteur: 'Jean',
      texte: gouvernanceRecord.noteDeContexte?.contenu ?? '',
    },
    uid: '123456',
  }
}
