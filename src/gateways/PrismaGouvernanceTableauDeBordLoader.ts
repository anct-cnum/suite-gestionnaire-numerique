import prisma from '../../prisma/prismaClient'
import { GouvernanceReadModel , RecupererTableauDeBordGouvernanceLoader } from '@/use-cases/queries/RecupererTableauDeBordGouvernance'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaGouvernanceTableauDeBordLoader implements RecupererTableauDeBordGouvernanceLoader {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async get(departementCode: string): Promise<ErrorReadModel | GouvernanceReadModel> {
    // Compter les membres de la gouvernance
    const membresGouvernance = await prisma.membreGouvernanceDepartementRecord.findMany({
      where: {
        departementCode,
      },
    })

    const totalMembres = membresGouvernance.length
    const coporteurs = membresGouvernance.filter(membre => membre.role === 'coporteur').length

    // Compter les collectivités impliquées
    const membresCollectivites = await prisma.membreRecord.findMany({
      where: {
        gouvernanceDepartementCode: departementCode,
        type: 'collectivite',
      },
    })

    const totalCollectivites = membresCollectivites.length
    const membresCollectivitesTotal = membresCollectivites.length

    // Compter les feuilles de route et actions
    const feuillesDeRoute = await prisma.feuilleDeRouteRecord.findMany({
      include: {
        action: true,
      },
      where: {
        gouvernanceDepartementCode: departementCode,
      },
    })

    const totalFeuillesDeRoute = feuillesDeRoute.length
    const totalActions = feuillesDeRoute.reduce((acc, feuille) => acc + feuille.action.length, 0)

    return {
      collectivite: {
        membre: membresCollectivitesTotal,
        total: totalCollectivites,
      },
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