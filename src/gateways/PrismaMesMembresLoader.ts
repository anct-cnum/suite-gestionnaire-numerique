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
            relationContact: true,
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
      departement: gouvernanceRecord.relationDepartement.nom,
      membres: toMembres(gouvernanceRecord.membres)
        .toSorted(sortMembres)
        .map(toMesMembresReadModel),
      roles: [],
      typologies: [],
      uidGouvernance: codeDepartementGouvernance,
    }
  }
}

function toMesMembresReadModel(membre: Membre): MembreReadModel {
  let contactReferent: Membre['contactReferent']
  if (membre.contactReferent) {
    contactReferent = {
      email: membre.contactReferent.email,
      fonction: membre.contactReferent.fonction,
      nom: membre.contactReferent.nom,
      prenom: membre.contactReferent.prenom,
    }
  }

  return {
    adresse: 'Adresse bouchonnée',
    contactReferent,
    nom: membre.nom,
    roles: membre.roles as MesMembresReadModel['roles'],
    siret: 'Siret bouchonné',
    statut: membre.statut as MembreReadModel['statut'],
    suppressionDuMembreAutorise: false,
    typologie: membre.type ?? '',
    uid: membre.id,
  }
}
