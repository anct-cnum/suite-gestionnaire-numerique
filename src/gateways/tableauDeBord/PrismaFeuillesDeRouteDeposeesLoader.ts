import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import {
  FeuillesDeRouteDeposeesLoader,
  FeuillesDeRouteDeposeesReadModel,
} from '@/use-cases/queries/RecupererFeuillesDeRouteDeposees'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaFeuillesDeRouteDeposeesLoader implements FeuillesDeRouteDeposeesLoader {
  async get(): Promise<ErrorReadModel | FeuillesDeRouteDeposeesReadModel> {
    try {
      // Récupérer toutes les feuilles de route avec leurs actions et demandes de subvention
      const feuillesDeRoute = await prisma.feuilleDeRouteRecord.findMany({
        include: {
          action: {
            include: {
              demandesDeSubvention: true,
            },
          },
        },
      })

      // Compter les feuilles de route sans demande de subvention (non déposées)
      const feuillesDeRouteSansDemandeSubvention = feuillesDeRoute.filter(
        (feuilleDeRoute) => {
          const aTotalDemandesSubvention = feuilleDeRoute.action.some(
            (action) => action.demandesDeSubvention.length > 0
          )
          return !aTotalDemandesSubvention
        }
      ).length

      // Compter seulement les feuilles de route déposées (avec au moins 1 demande de subvention)
      const feuillesDeRouteDeposees = feuillesDeRoute.filter(
        (feuilleDeRoute) => {
          return feuilleDeRoute.action.some(
            (action) => action.demandesDeSubvention.length > 0
          )
        }
      )

      // Regrouper les feuilles de route déposées par périmètre géographique
      const feuillesParPerimetre = new Map<string, number>()

      feuillesDeRouteDeposees.forEach((feuilleDeRoute) => {
        const perimetre = feuilleDeRoute.perimetreGeographique ?? 'Autre'
        feuillesParPerimetre.set(perimetre, (feuillesParPerimetre.get(perimetre) ?? 0) + 1)
      })

      // Convertir en tableau trié par nombre décroissant
      const ventilationParPerimetre = Array.from(feuillesParPerimetre.entries())
        .map(([perimetre, count]) => ({ count, perimetre }))
        .sort((itemA, itemB) => itemB.count - itemA.count)

      return {
        nombreSansDemandeSubvention: feuillesDeRouteSansDemandeSubvention,
        nombreTotal: feuillesDeRoute.length,
        ventilationParPerimetre,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaFeuillesDeRouteDeposeesLoader', {
        operation: 'get',
      })
      return {
        message: 'Erreur lors de la récupération des feuilles de route déposées',
        type: 'error' as const,
      }
    }
  }
}
