import { Membre, sortMembres, toMembres } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { MembreReadModel, MesMembresLoader, MesMembresReadModel } from '@/use-cases/queries/RecupererMesMembres'

export class PrismaMesMembresLoader implements MesMembresLoader {
  readonly #dataResource = prisma.gouvernanceRecord

  async get(codeDepartementGouvernance: string): Promise<MesMembresReadModel> {
    const gouvernanceRecord = await this.#dataResource.findUniqueOrThrow({
      include: {
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
      },
      where: {
        departementCode: codeDepartementGouvernance,
      },
    })

    return {
      autorisations: {
        accesMembreConfirme: false,
        ajouterUnMembre: false,
        supprimerUnMembre: false,
      },
      departement: 'Rhône',
      membres: toMembres(gouvernanceRecord.membres)
        .toSorted(sortMembres)
        .map(toMesMembresReadModel),
      roles: [],
      typologies: [],
    }
  }
}

function toMesMembresReadModel(membre: Membre): MembreReadModel {
  return {
    contactReferent: {
      nom: 'Dupont',
      prenom: 'Valérie',
    },
    nom: membre.nom,
    roles: membre.roles as MesMembresReadModel['roles'],
    suppressionDuMembreAutorise: false,
    typologie: membre.type ?? '',
  }
}
