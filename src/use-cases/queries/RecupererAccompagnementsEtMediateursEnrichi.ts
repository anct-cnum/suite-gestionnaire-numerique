import { AccompagnementsEtMediateursLoader, AccompagnementsEtMediateursReadModel } from './RecupererAccompagnementsEtMediateurs'
import { StatistiquesCoopLoader, StatistiquesFilters } from './RecupererStatistiquesCoop'
import { ErrorReadModel } from './shared/ErrorReadModel'

export class RecupererAccompagnementsEtMediateursEnrichi {
  private readonly accompagnementsLoader: AccompagnementsEtMediateursLoader
  private readonly statistiquesCoopLoader: StatistiquesCoopLoader

  constructor(
    accompagnementsLoader: AccompagnementsEtMediateursLoader,
    statistiquesCoopLoader: StatistiquesCoopLoader
  ) {
    this.accompagnementsLoader = accompagnementsLoader
    this.statistiquesCoopLoader = statistiquesCoopLoader
  }

  async execute(query: RecupererAccompagnementsEtMediateursEnrichiQuery): 
  Promise<AccompagnementsEtMediateursEnrichiReadModel | ErrorReadModel> {
    try {
      // 1. Récupérer les données Prisma (accompagnements, médiateurs, etc.)
      const accompagnementsData = await this.accompagnementsLoader.get(query.territoire)
      
      if (isErrorReadModel(accompagnementsData)) {
        return accompagnementsData
      }

      // 2. Récupérer les statistiques des bénéficiaires via l'API Coop
      let beneficiairesAccompagnes = 0
      let erreurApiCoop: null | string = null

      try {
        const filtres = this.construireFiltresApiCoop(query.territoire)
        const statistiquesCoop = await this.statistiquesCoopLoader.recupererStatistiques(filtres)
        beneficiairesAccompagnes = statistiquesCoop.totaux.beneficiaires.total
      } catch (error) {
        // En cas d'erreur API Coop, on continue avec les données Prisma
        // mais on note l'erreur pour l'affichage
        erreurApiCoop = error instanceof Error ? error.message : 'Erreur inconnue de l\'API Coop'
        // eslint-disable-next-line no-console
        console.warn('Erreur API Coop, utilisation des données partielles:', erreurApiCoop)
      }

      // 3. Combiner les données
      return {
        ...accompagnementsData,
        beneficiairesAccompagnes,
        erreurApiCoop,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      return {
        message: `Impossible de récupérer les données complètes des accompagnements et médiateurs: ${errorMessage}`,
        type: 'error' as const,
      }
    }
  }

  private construireFiltresApiCoop(territoire?: string): StatistiquesFilters | undefined {
    // Si c'est pour toute la France, pas de filtre départemental
    if (typeof territoire !== 'string' || territoire.trim() === '' || territoire === 'France') {
      return undefined
    }

    // Sinon, filtrer par département
    return {
      departements: [territoire],
    }
  }
}

type AccompagnementsEtMediateursEnrichiReadModel = AccompagnementsEtMediateursReadModel & Readonly<{
  beneficiairesAccompagnes: number
  erreurApiCoop: null | string
}>

type RecupererAccompagnementsEtMediateursEnrichiQuery = Readonly<{
  territoire?: string
}>

function isErrorReadModel(readModel: unknown): readModel is ErrorReadModel {
  return typeof readModel === 'object' && readModel !== null && 'type' in readModel && readModel.type === 'error'
}