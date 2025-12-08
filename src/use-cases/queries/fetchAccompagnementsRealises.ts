import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'
import { reportLoaderError } from '@/gateways/shared/sentryErrorReporter'
import { PrismaAccompagnementsRealisesParACLoader } from '@/gateways/tableauDeBord/PrismaAccompagnementsRealisesParACLoader'

/**
 * Résultat de la récupération des accompagnements réalisés (AC + Coop)
 */
export type AccompagnementsRealisesResult = Readonly<{
  nombreTotal: number
  repartitionMensuelle: ReadonlyArray<{
    mois: string
    nombre: number
  }>
}>

/**
 * Récupère le nombre d'accompagnements réalisés en combinant AC (base de données) et Coop (API)
 * @param territoire - Code département ou 'France' pour les stats nationales
 * @returns Promise avec le nombre total et la répartition mensuelle
 */
export async function fetchAccompagnementsRealises(
  territoire: string
): Promise<AccompagnementsRealisesResult | ErrorViewModel> {
  try {
    // Récupérer les accompagnements AC depuis la base de données
    const accompagnementsACLoader = new PrismaAccompagnementsRealisesParACLoader()
    const accompagnementsAC = await accompagnementsACLoader.get(territoire)

    if (isErrorViewModel(accompagnementsAC)) {
      return accompagnementsAC
    }

    // Récupérer les statistiques Coop depuis l'API
    const statistiquesCoopLoader = createApiCoopStatistiquesLoader()
    const filters = territoire === 'France'
      ? undefined
      : { departements: [territoire] }

    const statistiquesCoop = await statistiquesCoopLoader.recupererStatistiques(filters)

    // Calculer le total combiné
    const nombreTotal = accompagnementsAC.nombreTotalAC + statistiquesCoop.totaux.accompagnements.total

    // Récupérer la répartition mensuelle depuis l'API Coop (6 derniers mois)
    const repartitionMensuelle = statistiquesCoop.accompagnementsParMois
      .slice(-6)
      .map((item) => ({
        mois: item.label,
        nombre: item.count,
      }))

    return {
      nombreTotal,
      repartitionMensuelle,
    }
  } catch (error) {
    reportLoaderError(error, 'fetchAccompagnementsRealises', { territoire })
    return {
      message: error instanceof Error
        ? error.message
        : 'Erreur inconnue lors de la récupération des accompagnements',
      type: 'error',
    } as ErrorViewModel
  }
}
