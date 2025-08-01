import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { GouvernanceAdminReadModel, RecupererTableauDeBordGouvernanceAdminLoader } from '@/use-cases/queries/RecupererTableauDeBordGouvernance'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaGouvernanceAdminLoader implements RecupererTableauDeBordGouvernanceAdminLoader {
  readonly #feuilleDeRouteDao = prisma.feuilleDeRouteRecord
  readonly #gouvernanceDao = prisma.gouvernanceRecord
  readonly #membreDao = prisma.membreRecord

  async get(): Promise<ErrorReadModel | GouvernanceAdminReadModel> {
    try {
      // Compter toutes les gouvernances (excluant 'zzz')
      const gouvernances = await this.#gouvernanceDao.findMany({
        where: {
          departementCode: {
            not: 'zzz',
          },
        },
      })

      const nombreGouvernances = gouvernances.length

      // Pour chaque gouvernance, compter les co-porteurs
      const gouvernancesAvecCoPorteurs = await Promise.all(
        gouvernances.map(async (gouvernance) => {
          const coporteurs = await this.#membreDao.count({
            where: {
              gouvernanceDepartementCode: gouvernance.departementCode,
              isCoporteur: true,
              statut: {
                not: 'supprime',
              },
            },
          })
          return {
            departementCode: gouvernance.departementCode,
            nombreCoPorteurs: coporteurs,
          }
        })
      )

      // Compter les gouvernances qui ont plus de 2 co-porteurs
      const nombreGouvernancesCoPortees = gouvernancesAvecCoPorteurs.filter(
        (gov) => gov.nombreCoPorteurs > 2
      ).length

      // Compter les feuilles de route et actions (France entière, excluant zzz)
      const feuillesDeRoute = await this.#feuilleDeRouteDao.findMany({
        include: {
          action: true,
        },
        where: {
          gouvernanceDepartementCode: {
            not: 'zzz',
          },
        },
      })

      const totalFeuillesDeRoute = feuillesDeRoute.length
      const totalActions = feuillesDeRoute.reduce((acc, feuille) => acc + feuille.action.length, 0)

      return {
        feuilleDeRoute: {
          action: totalActions,
          total: totalFeuillesDeRoute,
        },
        nombreGouvernances,
        nombreGouvernancesCoPortees,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaGouvernanceAdminLoader', {
        operation: 'get',
      })
      return {
        message: 'Impossible de récupérer les données de gouvernance admin',
        type: 'error',
      }
    }
  }
}