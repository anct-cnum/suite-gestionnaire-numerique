import { StatistiquesCoopLoader, StatistiquesCoopReadModel, StatistiquesFilters } from '@/use-cases/queries/RecupererStatistiquesCoop'

export class ApiCoopStatistiquesLoader implements StatistiquesCoopLoader {
  private readonly baseUrl = 'https://coop-numerique.anct.gouv.fr/api/v1'
  
  async recupererStatistiques(filtres?: StatistiquesFilters): Promise<StatistiquesCoopReadModel> {
    try {
      const url = this.construireUrl(filtres)
      const reponse = await this.recupererAvecTentatives(url)
      const donnees = await this.gererReponse(reponse)
      
      return this.transformerReponse(donnees)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération des statistiques: ${errorMessage}`)
    }
  }

  private construireUrl(filtres?: StatistiquesFilters): string {
    const url = new URL(`${this.baseUrl}/statistiques`)
    
    if (filtres) {
      if (filtres.du) url.searchParams.append('filter[du]', filtres.du)
      if (filtres.au) url.searchParams.append('filter[au]', filtres.au)
      if (filtres.types) url.searchParams.append('filter[types]', filtres.types.join(','))
      if (filtres.mediateurs) url.searchParams.append('filter[mediateurs]', filtres.mediateurs.join(','))
      if (filtres.beneficiaires) url.searchParams.append('filter[beneficiaires]', filtres.beneficiaires.join(','))
      if (filtres.communes) url.searchParams.append('filter[communes]', filtres.communes.join(','))
      if (filtres.departements) url.searchParams.append('filter[departements]', filtres.departements.join(','))
      if (filtres.lieux) url.searchParams.append('filter[lieux]', filtres.lieux.join(','))
      if (filtres.conseillerNumerique !== undefined) {
        url.searchParams.append('filter[conseiller_numerique]', filtres.conseillerNumerique ? '1' : '0')
      }
    }
    
    return url.toString()
  }

  private configurationEntetes(): Record<string, string> {
    const entetes: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }

    if (!process.env.COOP_TOKEN) {
      throw new Error('Token COOP_TOKEN non configuré')
    }
    
    entetes['Authorization'] = `Bearer ${process.env.COOP_TOKEN}`
    
    return entetes
  }

  private async recupererAvecTentatives(url: string): Promise<Response> {
    let reponse: Response | undefined
    let derniereErreur: Error | null = null

    for (let tentative = 1; tentative <= 3; tentative += 1) {
      try {
        const entetes = this.configurationEntetes()
        
        // eslint-disable-next-line no-await-in-loop
        reponse = await fetch(url, {
          method: 'GET',
          headers: entetes,
          signal: AbortSignal.timeout(15000), // 15 secondes de timeout
        })
        
        break
      } catch (erreur) {
        derniereErreur = erreur as Error
        
        if (tentative === 3) {
          throw new Error(`Échec de connexion à l'API Coop après 3 tentatives: ${derniereErreur.message}`)
        }
        
        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => {
          setTimeout(resolve, tentative * 500)
        })
      }
    }
    
    if (!reponse) {
      throw new Error(`Échec de connexion à l'API Coop: ${derniereErreur?.message}`)
    }
    
    return reponse
  }

  private async gererReponse(reponse: Response): Promise<CoopApiResponse> {
    if (!reponse.ok) {
      const texteErreur = await reponse.text()
      
      if (reponse.status === 401) {
        throw new Error('Token d\'authentification invalide ou expiré')
      }
      
      if (reponse.status === 403) {
        throw new Error('Accès refusé aux statistiques')
      }
      
      if (reponse.status === 429) {
        throw new Error('Trop de requêtes. Veuillez réessayer dans quelques instants.')
      }
      
      throw new Error(`Erreur API Coop: ${reponse.status} - ${texteErreur}`)
    }
    
    const donnees = await reponse.json()
    
    // Debug: afficher la structure de la réponse
    if (process.env.NODE_ENV === 'development') {
      console.log('Réponse API Coop:', JSON.stringify(donnees, null, 2))
    }
    
    return donnees as CoopApiResponse
  }

  private transformerReponse(donnees: CoopApiResponse): StatistiquesCoopReadModel {
    if (!donnees || !donnees.data || !donnees.data.attributes) {
      throw new Error('Réponse API invalide: structure de données manquante')
    }
    
    const attributes = donnees.data.attributes
    
    return {
      accompagnementsParJour: attributes.accompagnements_par_jour.map(item => ({
        label: item.label,
        count: item.count,
      })),
      accompagnementsParMois: attributes.accompagnements_par_mois.map(item => ({
        label: item.label,
        count: item.count,
      })),
      beneficiaires: {
        total: attributes.beneficiaires.total,
        genres: attributes.beneficiaires.genres.map(item => ({
          value: item.value,
          label: item.label,
          count: item.count,
          proportion: item.proportion,
        })),
        trancheAges: attributes.beneficiaires.tranche_ages.map(item => ({
          value: item.value,
          label: item.label,
          count: item.count,
          proportion: item.proportion,
        })),
        statutsSocial: attributes.beneficiaires.statuts_social.map(item => ({
          value: item.value,
          label: item.label,
          count: item.count,
          proportion: item.proportion,
        })),
      },
      activites: {
        total: attributes.activites.total,
        typeActivites: attributes.activites.type_activites.map(item => ({
          value: item.value,
          label: item.label,
          count: item.count,
          proportion: item.proportion,
        })),
        durees: attributes.activites.durees.map(item => ({
          value: item.value,
          label: item.label,
          count: item.count,
          proportion: item.proportion,
        })),
        typeLieu: attributes.activites.type_lieu.map(item => ({
          value: item.value,
          label: item.label,
          count: item.count,
          proportion: item.proportion,
        })),
        thematiques: attributes.activites.thematiques.map(item => ({
          value: item.value,
          label: item.label,
          count: item.count,
          proportion: item.proportion,
        })),
        materiels: attributes.activites.materiels.map(item => ({
          value: item.value,
          label: item.label,
          count: item.count,
          proportion: item.proportion,
        })),
      },
      totaux: {
        activites: {
          total: attributes.totaux.activites.total,
          individuels: {
            total: attributes.totaux.activites.individuels.total,
            proportion: attributes.totaux.activites.individuels.proportion,
          },
          collectifs: {
            total: attributes.totaux.activites.collectifs.total,
            proportion: attributes.totaux.activites.collectifs.proportion,
            participants: attributes.totaux.activites.collectifs.participants,
          },
          demarches: attributes.totaux.activites.demarches ? {
            total: attributes.totaux.activites.demarches.total,
            proportion: attributes.totaux.activites.demarches.proportion,
          } : {
            total: 0,
            proportion: 0,
          },
        },
        accompagnements: {
          total: attributes.totaux.accompagnements.total,
          individuels: {
            total: attributes.totaux.accompagnements.individuels.total,
            proportion: attributes.totaux.accompagnements.individuels.proportion,
          },
          collectifs: {
            total: attributes.totaux.accompagnements.collectifs.total,
            proportion: attributes.totaux.accompagnements.collectifs.proportion,
          },
          demarches: attributes.totaux.accompagnements.demarches ? {
            total: attributes.totaux.accompagnements.demarches.total,
            proportion: attributes.totaux.accompagnements.demarches.proportion,
          } : {
            total: 0,
            proportion: 0,
          },
        },
        beneficiaires: {
          total: attributes.totaux.beneficiaires.total,
          nouveaux: attributes.totaux.beneficiaires.nouveaux,
          suivis: attributes.totaux.beneficiaires.suivis,
          anonymes: attributes.totaux.beneficiaires.anonymes,
        },
      },
    }
  }
}

// Types pour la réponse de l'API Coop
type CoopApiResponse = Readonly<{
  data: Readonly<{
    type: string
    id: string
    attributes: CoopStatistiquesAttributes
  }>
  links: Readonly<{
    self: Readonly<{
      href: string
    }>
  }>
  meta: Record<string, unknown>
}>

type CoopStatistiquesAttributes = Readonly<{
  accompagnements_par_jour: ReadonlyArray<Readonly<{
    label: string
    count: number
  }>>
  accompagnements_par_mois: ReadonlyArray<Readonly<{
    label: string
    count: number
  }>>
  beneficiaires: Readonly<{
    total: number
    genres: ReadonlyArray<StatistiquesItem>
    tranche_ages: ReadonlyArray<StatistiquesItem>
    statuts_social: ReadonlyArray<StatistiquesItem>
  }>
  activites: Readonly<{
    total: number
    type_activites: ReadonlyArray<StatistiquesItem>
    durees: ReadonlyArray<StatistiquesItem>
    type_lieu: ReadonlyArray<StatistiquesItem>
    thematiques: ReadonlyArray<StatistiquesItem>
    materiels: ReadonlyArray<StatistiquesItem>
  }>
  totaux: Readonly<{
    activites: Readonly<{
      total: number
      individuels: Readonly<{
        total: number
        proportion: number
      }>
      collectifs: Readonly<{
        total: number
        proportion: number
        participants: number
      }>
      demarches?: Readonly<{
        total: number
        proportion: number
      }>
    }>
    accompagnements: Readonly<{
      total: number
      individuels: Readonly<{
        total: number
        proportion: number
      }>
      collectifs: Readonly<{
        total: number
        proportion: number
      }>
      demarches?: Readonly<{
        total: number
        proportion: number
      }>
    }>
    beneficiaires: Readonly<{
      total: number
      nouveaux: number
      suivis: number
      anonymes: number
    }>
  }>
}>

type StatistiquesItem = Readonly<{
  value: string
  label: string
  count: number
  proportion: number
}>