import { StatistiquesFilters } from './RecupererStatistiquesCoop'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'
import { reportLoaderError } from '@/gateways/shared/sentryErrorReporter'

/**
 * Résultat de la récupération des bénéficiaires et accompagnements depuis l'API Coop
 */
export type BeneficiairesEtAccompagnementsResult = Readonly<{
  accompagnements: number
  beneficiaires: number
}>

/**
 * Récupère le nombre de bénéficiaires et d'accompagnements depuis l'API Coop
 * @param codeDepartement - Si undefined, retourne les stats France entière
 * @param periode - Période optionnelle avec dates de début et fin pour filtrer les statistiques
 * @returns Promise avec le nombre de bénéficiaires et d'accompagnements
 */
export async function fetchBeneficiairesEtAccompagnements(
  codeDepartement?: string,
  periode?: { depuis: Date; jusqua: Date }
): Promise<BeneficiairesEtAccompagnementsResult | ErrorViewModel> {
  try {
    const loader = createApiCoopStatistiquesLoader()

    // Créer le filtre selon les paramètres fournis
    let filters: StatistiquesFilters | undefined

    // Construire le filtre selon les paramètres disponibles
    if (periode !== undefined || codeDepartement !== undefined) {
      filters = {
        ...periode !== undefined && {
          au: periode.jusqua.toISOString().split('T')[0],
          du: periode.depuis.toISOString().split('T')[0],
        },
        ...codeDepartement !== undefined && {
          departements: [codeDepartement],
        },
      }
    }
    // Si aucun paramètre, filters reste undefined = France entière sans filtre

    const statistiques = await loader.recupererStatistiques(filters)
    return {
      accompagnements: statistiques.totaux.accompagnements.total,
      beneficiaires: statistiques.totaux.beneficiaires.total,
    }
  } catch (error) {
    reportLoaderError(error, 'fetchBeneficiairesEtAccompagnements')
    return {
      message: error instanceof Error ? error.message : 'Erreur inconnue lors de la récupération des données',
      type: 'error',
    } as ErrorViewModel
  }
}

/**
 * Récupère le nombre de bénéficiaires depuis l'API Coop
 * @param codeDepartement - Si undefined, retourne les stats France entière
 * @param periode - Période optionnelle avec dates de début et fin pour filtrer les statistiques
 * @returns Promise avec le nombre de bénéficiaires
 * @deprecated Utiliser fetchBeneficiairesEtAccompagnements à la place
 */
export async function fetchTotalBeneficiaires(
  codeDepartement?: string,
  periode?: { depuis: Date; jusqua: Date }
): Promise<ErrorViewModel | number> {
  const result = await fetchBeneficiairesEtAccompagnements(codeDepartement, periode)
  if ('type' in result) {
    return result
  }
  return result.beneficiaires
}