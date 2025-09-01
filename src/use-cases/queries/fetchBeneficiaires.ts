import { StatistiquesFilters } from './RecupererStatistiquesCoop'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'

/**
 * Récupère le nombre de bénéficiaires depuis l'API Coop
 * @param codeDepartement - Si undefined, retourne les stats France entière
 * @returns Promise avec le nombre de bénéficiaires
 */
export async function fetchTotalBeneficiaires(codeDepartement?: string): Promise<ErrorViewModel |number> {
  try {
    const loader = createApiCoopStatistiquesLoader()
    
    // Si un département est fourni, créer le filtre, sinon undefined = France entière
    const filters: StatistiquesFilters | undefined = codeDepartement === undefined 
      ? undefined
      : { departements: [codeDepartement] }
    
    const statistiques = await loader.recupererStatistiques(filters)
    return statistiques.totaux.beneficiaires.total
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Erreur inconnue lors de la récupération des bénéficiaires',
      type: 'error',
    } as ErrorViewModel
  }
}