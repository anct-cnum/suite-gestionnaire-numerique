import { isCoporteur, isPrefectureDepartementale, Membre, membreInclude, toMembres } from './shared/MembresGouvernance'
import prisma from '../../prisma/prismaClient'
import { alphaAsc, byPredicate } from '@/shared/lang'
import { MembreReadModel, MesMembresLoader, MesMembresReadModel } from '@/use-cases/queries/RecupererMesMembres'

export class PrismaMesMembresLoader implements MesMembresLoader {
  readonly #dataResource = prisma.gouvernanceRecord

  async get(codeDepartementGouvernance: string): Promise<MesMembresReadModel> {
    const gouvernanceRecord = await this.#dataResource.findUniqueOrThrow({
      include: {
        membres: {
          include: membreInclude,
          orderBy: {
            id: 'asc',
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
        .toSorted(alphaAsc('nom'))
        .toSorted(byPredicate(isCoporteur))
        .toSorted(byPredicate(isPrefectureDepartementale))
        .map(membre => toMesMembresReadModel(membre)),
      roles: [],
      typologies: [],
      uidGouvernance: codeDepartementGouvernance,
    }
  }
}

function toMesMembresReadModel(membre: Membre): MembreReadModel {
  return {
    adresse: '', // TODO: Récupérer l'adresse depuis les données du membre
    contactReferent: {
      email: membre.contactReferent.email,
      fonction: membre.contactReferent.fonction,
      nom: membre.contactReferent.nom,
      prenom: membre.contactReferent.prenom,
    },
    isDeletable: !isPrefectureDepartementale(membre),
    nom: membre.nom,
    roles: membre.roles,
    siret: '', // TODO: Récupérer le SIRET depuis les données du membre
    statut: membre.statut as any, // TODO: Corriger le type Statut
    suppressionDuMembreAutorise: true, // TODO: Logique métier à implémenter
    typologie: membre.type,
    uid: membre.id,
  }
}
