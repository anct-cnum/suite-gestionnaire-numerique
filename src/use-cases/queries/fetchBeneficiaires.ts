import { StatistiquesFilters } from './RecupererStatistiquesCoop'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'

/**
 * Récupère le nombre de bénéficiaires depuis l'API Coop
 * @param codeDepartement - Si undefined, retourne les stats France entière
 * @param periode - Période optionnelle avec dates de début et fin pour filtrer les statistiques
 * @returns Promise avec le nombre de bénéficiaires
 */
export async function fetchTotalBeneficiaires(
  codeDepartement?: string, 
  periode?: { depuis: Date; jusqua: Date }
): Promise<ErrorViewModel | number> {
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
    return statistiques.totaux.beneficiaires.total
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Erreur inconnue lors de la récupération des bénéficiaires',
      type: 'error',
    } as ErrorViewModel
  }
}