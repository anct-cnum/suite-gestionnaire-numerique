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
      candidats: toMembres(gouvernanceRecord.membres, 'candidat')
        .toSorted(sortMembres)
        .map(toMesMembresReadModel),
      departement: gouvernanceRecord.relationDepartement.nom,
      membres: toMembres(gouvernanceRecord.membres, 'confirme')
        .toSorted(sortMembres)
        .map(toMesMembresReadModel),
      roles: [],
      suggeres: toMembres(gouvernanceRecord.membres, 'suggere')
        .toSorted(sortMembres)
        .map(toMesMembresReadModel),
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
    suppressionDuMembreAutorise: false,
    typologie: membre.type ?? '',
    uidMembre: membre.id,
  }
}
