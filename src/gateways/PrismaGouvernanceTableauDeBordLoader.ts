import prisma from '../../prisma/prismaClient'
import { GouvernanceReadModel , RecupererTableauDeBordGouvernanceLoader } from '@/use-cases/queries/RecupererTableauDeBordGouvernance'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaGouvernanceTableauDeBordLoader implements RecupererTableauDeBordGouvernanceLoader {
  async get(territoire: string): Promise<ErrorReadModel | GouvernanceReadModel> {
    // Compter les membres de la gouvernance (non supprimés)
    const membresGouvernance = await prisma.membreRecord.findMany({
      where: territoire === 'France' ? {
        gouvernanceDepartementCode: {
          not: 'zzz',
        },
        statut: {
          not: 'supprime', // Exclure les membres supprimés
        },
      } : {
        gouvernanceDepartementCode: territoire,
        statut: {
          not: 'supprime', // Exclure les membres supprimés
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
      where: territoire === 'France' ? {
        gouvernanceDepartementCode: {
          not: 'zzz',
        },
      } : {
        gouvernanceDepartementCode: territoire,
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
