import { AccompagnementsEtMediateursLoader, AccompagnementsEtMediateursReadModel } from './RecupererAccompagnementsEtMediateurs'
import { StatistiquesCoopLoader, StatistiquesFilters } from './RecupererStatistiquesCoop'
import { ErrorReadModel } from './shared/ErrorReadModel'

export class RecupererAccompagnementsEtMediateursEnrichi {
  constructor(
    private readonly accompagnementsLoader: AccompagnementsEtMediateursLoader,
    private readonly statistiquesCoopLoader: StatistiquesCoopLoader
  ) {}

  async execute(query: RecupererAccompagnementsEtMediateursEnrichiQuery): Promise<AccompagnementsEtMediateursEnrichiReadModel | ErrorReadModel> {
    try {
      // 1. Récupérer les données Prisma (accompagnements, médiateurs, etc.)
      const accompagnementsData = await this.accompagnementsLoader.get(query.territoire)
      
      if ('type' in accompagnementsData && accompagnementsData.type === 'error') {
        return accompagnementsData
      }

      // 2. Récupérer les statistiques des bénéficiaires via l'API Coop
      let beneficiairesAccompagnes = 0
      let erreurApiCoop: string | null = null

      try {
        const filtres = this.construireFiltresApiCoop(query.territoire)
        const statistiquesCoop = await this.statistiquesCoopLoader.recupererStatistiques(filtres)
        beneficiairesAccompagnes = statistiquesCoop.totaux.beneficiaires.total
      } catch (error) {
        // En cas d'erreur API Coop, on continue avec les données Prisma
        // mais on note l'erreur pour l'affichage
        erreurApiCoop = error instanceof Error ? error.message : 'Erreur inconnue de l\'API Coop'
        console.warn('Erreur API Coop, utilisation des données partielles:', erreurApiCoop)
      }

      // 3. Combiner les données
      return {
        ...accompagnementsData,
        beneficiairesAccompagnes,
        erreurApiCoop,
      }

    } catch (error) {
      return {
        message: 'Impossible de récupérer les données complètes des accompagnements et médiateurs',
        type: 'error' as const,
      }
    }
  }

  private construireFiltresApiCoop(territoire?: string): StatistiquesFilters | undefined {
    // Si c'est pour toute la France, pas de filtre départemental
    if (!territoire || territoire === 'France') {
      return undefined
    }

    // Sinon, filtrer par département
    return {
      departements: [territoire]
    }
  }
}

type RecupererAccompagnementsEtMediateursEnrichiQuery = Readonly<{
  territoire?: string
}>

export type AccompagnementsEtMediateursEnrichiReadModel = AccompagnementsEtMediateursReadModel & Readonly<{
  beneficiairesAccompagnes: number
  erreurApiCoop: string | null
}>