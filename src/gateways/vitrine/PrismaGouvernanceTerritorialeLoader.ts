import prisma from '../../../prisma/prismaClient'
import { Membre, membreInclude, toMembre } from '../shared/MembresGouvernance'
import { classerParCategorieJuridique } from '@/shared/categorieJuridique'
import {
  GouvernanceTerritorialeLoader,
  GouvernanceTerritorialeReadModel,
  MembreTerritorialReadModel,
  RoleMembre,
} from '@/use-cases/queries/vitrine/RecupererGouvernanceTerritoriale'

export class PrismaGouvernanceTerritorialeLoader implements GouvernanceTerritorialeLoader {
  async get(codeDepartement: string): Promise<GouvernanceTerritorialeReadModel> {
    // Récupérer les statistiques
    const statistiques = await this.#getStatistiques(codeDepartement)

    // Récupérer les membres détaillés
    const membres = await this.#getMembres(codeDepartement)

    return {
      membres,
      statistiques,
      territoire: codeDepartement,
    }
  }

  #determinerCategorie(membre: Membre, codeCategorieJuridique: null | string): string {
    if (membre.estPrefectureDepartementale) {
      return 'departement'
    }
    const classement = classerParCategorieJuridique(codeCategorieJuridique)
    if (classement.famille === 'etat') {
      return 'sgar'
    }
    return categoriesParLibelle[classement.libelle] ?? 'autre'
  }

  async #getMembres(codeDepartement: string): Promise<ReadonlyArray<MembreTerritorialReadModel>> {
    const membresRecords = await prisma.membreRecord.findMany({
      include: membreInclude,
      where: {
        gouvernanceDepartementCode: codeDepartement,
        statut: {
          equals: 'confirme',
        },
      },
    })

    return membresRecords.map((membreRecord) => {
      const membre = toMembre(membreRecord)
      return {
        categorie: this.#determinerCategorie(membre, membreRecord.relationStructureAdministrative.categorie_juridique),
        details: [
          {
            information: membre.typologie,
            intitule: 'Type de structure',
          },
        ],
        id: membre.id,
        nom: membre.nom,
        roles: membre.roles as ReadonlyArray<RoleMembre>,
        type: membre.typologie,
      }
    })
  }

  async #getStatistiques(codeDepartement: string): Promise<GouvernanceTerritorialeReadModel['statistiques']> {
    // Compter les membres de la gouvernance (non supprimés)
    const membresGouvernance = await prisma.membreRecord.findMany({
      where: {
        gouvernanceDepartementCode: codeDepartement,
        statut: {
          equals: 'confirme',
        },
      },
    })

    const totalMembres = membresGouvernance.length
    const coporteurs = membresGouvernance.filter((membre) => membre.isCoporteur).length

    // Compter les feuilles de route et actions
    const feuillesDeRoute = await prisma.feuilleDeRouteRecord.findMany({
      include: {
        action: true,
      },
      where: {
        gouvernanceDepartementCode: codeDepartement,
      },
    })

    const totalFeuillesDeRoute = feuillesDeRoute.length
    const totalActions = feuillesDeRoute.reduce((acc, feuille) => acc + feuille.action.length, 0)

    return {
      feuilleDeRoute: {
        action: totalActions,
        total: totalFeuillesDeRoute,
      },
      membre: {
        coporteur: coporteurs,
        total: totalMembres,
      },
    }
  }
}

// Catégorie d'affichage (logo) de la vitrine selon le classement par catégorie juridique
const categoriesParLibelle: Readonly<Record<string, string>> = {
  'Associations et fondations': 'structure',
  Communes: 'commune',
  'Conseils départementaux': 'departement',
  EPCI: 'epci',
}
