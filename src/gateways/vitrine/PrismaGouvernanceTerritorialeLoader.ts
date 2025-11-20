import prisma from '../../../prisma/prismaClient'
import { membreInclude, toMembres } from '../shared/MembresGouvernance'
import { GouvernanceTerritorialeLoader, GouvernanceTerritorialeReadModel, MembreTerritorialReadModel, RoleMembre } from '@/use-cases/queries/vitrine/RecupererGouvernanceTerritoriale'

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

  #determinerCategorie(type: string): string {
    // Déduire la catégorie depuis le type
    const typeLower = type.toLowerCase()

    if (typeLower.includes('préfecture') || typeLower.includes('département')) {
      return 'departement'
    }
    if (typeLower.includes('commune')) {
      return 'commune'
    }
    if (typeLower.includes('epci')) {
      return 'epci'
    }
    if (typeLower.includes('sgar')) {
      return 'sgar'
    }
    if (typeLower.includes('association') || typeLower.includes('structure')) {
      return 'structure'
    }
    return 'autre'
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

    const membres = toMembres(membresRecords)

    return membres.map(membre => ({
      categorie: this.#determinerCategorie(membre.type),
      details: [
        {
          information: membre.type,
          intitule: 'Type de structure',
        },
      ],
      id: membre.id,
      nom: membre.nom,
      // Filtrer les rôles 'observateur' et mapper au type RoleMembre
      roles: membre.roles.filter((role): role is RoleMembre =>
        role !== 'observateur'),
      type: membre.type,
    }))
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
    const coporteurs = membresGouvernance.filter(membre => membre.isCoporteur).length

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
