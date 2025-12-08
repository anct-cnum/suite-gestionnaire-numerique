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

  private configurationEntetes(): Record<string, string> {
    const entetes: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }

    if (typeof process.env.COOP_TOKEN !== 'string' || process.env.COOP_TOKEN.trim() === '') {
      throw new Error('Token COOP_TOKEN non configuré')
    }

    entetes.Authorization = `Bearer ${process.env.COOP_TOKEN}`

    return entetes
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private construireUrl(filtres?: StatistiquesFilters): string {
    const url = new URL(`${this.baseUrl}/statistiques`)

    if (filtres) {
      if (typeof filtres.du === 'string' && filtres.du.trim() !== '') {
        url.searchParams.append('filter[du]', filtres.du)
      }
      if (typeof filtres.au === 'string' && filtres.au.trim() !== '') {
        url.searchParams.append('filter[au]', filtres.au)
      }
      if (filtres.types) {url.searchParams.append('filter[types]', filtres.types.join(','))}
      if (filtres.mediateurs) {url.searchParams.append('filter[mediateurs]', filtres.mediateurs.join(','))}
      if (filtres.beneficiaires) {url.searchParams.append('filter[beneficiaires]', filtres.beneficiaires.join(','))}
      if (filtres.communes) {url.searchParams.append('filter[communes]', filtres.communes.join(','))}
      if (filtres.departements) {url.searchParams.append('filter[departements]', filtres.departements.join(','))}
      if (filtres.lieux) {url.searchParams.append('filter[lieux]', filtres.lieux.join(','))}
      if (filtres.conseillerNumerique !== undefined) {
        url.searchParams.append('filter[conseiller_numerique]', filtres.conseillerNumerique ? '1' : '0')
      }
    }

    return url.toString()
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

    const donnees = await reponse.json() as unknown

    // Debug: afficher la structure de la réponse
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Réponse API Coop:', JSON.stringify(donnees, null, 2))
    }

    return donnees as CoopApiResponse
  }

  private async recupererAvecTentatives(url: string): Promise<Response> {
    let reponse: Response | undefined
    let derniereErreur: Error | null = null

    for (let tentative = 1; tentative <= 3; tentative += 1) {
      try {
        const entetes = this.configurationEntetes()

        // eslint-disable-next-line no-await-in-loop
        reponse = await fetch(url, {
          headers: entetes,
          method: 'GET',
          signal: AbortSignal.timeout(60000), // 60 secondes de timeout
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

  private transformerReponse(donnees: CoopApiResponse): StatistiquesCoopReadModel {
    const attributes = donnees.data.attributes

    return {
      accompagnementsParJour: attributes.accompagnements_par_jour.map(item => ({
        count: item.count,
        label: item.label,
      })),
      accompagnementsParMois: attributes.accompagnements_par_mois.map(item => ({
        count: item.count,
        label: item.label,
      })),
      activites: {
        durees: attributes.activites.durees.map(item => ({
          count: item.count,
          label: item.label,
          proportion: item.proportion,
          value: item.value,
        })),
        materiels: attributes.activites.materiels.map(item => ({
          count: item.count,
          label: item.label,
          proportion: item.proportion,
          value: item.value,
        })),
        thematiques: attributes.activites.thematiques.map(item => ({
          count: item.count,
          label: item.label,
          proportion: item.proportion,
          value: item.value,
        })),
        thematiquesDemarches: attributes.activites.thematiques_demarches.map(item => ({
          count: item.count,
          label: item.label,
          proportion: item.proportion,
          value: item.value,
        })),
        total: attributes.activites.total,
        typeActivites: attributes.activites.type_activites.map(item => ({
          count: item.count,
          label: item.label,
          proportion: item.proportion,
          value: item.value,
        })),
        typeLieu: attributes.activites.type_lieu.map(item => ({
          count: item.count,
          label: item.label,
          proportion: item.proportion,
          value: item.value,
        })),
      },
      beneficiaires: {
        genres: attributes.beneficiaires.genres.map(item => ({
          count: item.count,
          label: item.label,
          proportion: item.proportion,
          value: item.value,
        })),
        statutsSocial: attributes.beneficiaires.statuts_social.map(item => ({
          count: item.count,
          label: item.label,
          proportion: item.proportion,
          value: item.value,
        })),
        total: attributes.beneficiaires.total,
        trancheAges: attributes.beneficiaires.tranche_ages.map(item => ({
          count: item.count,
          label: item.label,
          proportion: item.proportion,
          value: item.value,
        })),
      },
      totaux: {
        accompagnements: {
          collectifs: {
            proportion: attributes.totaux.accompagnements.collectifs.proportion,
            total: attributes.totaux.accompagnements.collectifs.total,
          },
          demarches: {
            proportion: attributes.totaux.accompagnements.demarches?.proportion ?? 0,
            total: attributes.totaux.accompagnements.demarches?.total ?? 0,
          },
          individuels: {
            proportion: attributes.totaux.accompagnements.individuels.proportion,
            total: attributes.totaux.accompagnements.individuels.total,
          },
          total: attributes.totaux.accompagnements.total,
        },
        activites: {
          collectifs: {
            participants: attributes.totaux.activites.collectifs.participants,
            proportion: attributes.totaux.activites.collectifs.proportion,
            total: attributes.totaux.activites.collectifs.total,
          },
          demarches: {
            proportion: attributes.totaux.activites.demarches?.proportion ?? 0,
            total: attributes.totaux.activites.demarches?.total ?? 0,
          },
          individuels: {
            proportion: attributes.totaux.activites.individuels.proportion,
            total: attributes.totaux.activites.individuels.total,
          },
          total: attributes.totaux.activites.total,
        },
        beneficiaires: {
          anonymes: attributes.totaux.beneficiaires.anonymes,
          nouveaux: attributes.totaux.beneficiaires.nouveaux,
          suivis: attributes.totaux.beneficiaires.suivis,
          total: attributes.totaux.beneficiaires.total,
        },
      },
    }
  }
}

// Types pour la réponse de l'API Coop
type CoopApiResponse = Readonly<{
  data: Readonly<{
    attributes: CoopStatistiquesAttributes
    id: string
    type: string
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
    count: number
    label: string
  }>>
  accompagnements_par_mois: ReadonlyArray<Readonly<{
    count: number
    label: string
  }>>
  activites: Readonly<{
    durees: ReadonlyArray<StatistiquesItem>
    materiels: ReadonlyArray<StatistiquesItem>
    thematiques: ReadonlyArray<StatistiquesItem>
    thematiques_demarches: ReadonlyArray<StatistiquesItem>
    total: number
    type_activites: ReadonlyArray<StatistiquesItem>
    type_lieu: ReadonlyArray<StatistiquesItem>
  }>
  beneficiaires: Readonly<{
    genres: ReadonlyArray<StatistiquesItem>
    statuts_social: ReadonlyArray<StatistiquesItem>
    total: number
    tranche_ages: ReadonlyArray<StatistiquesItem>
  }>
  totaux: Readonly<{
    accompagnements: Readonly<{
      collectifs: Readonly<{
        proportion: number
        total: number
      }>
      demarches?: Readonly<{
        proportion: number
        total: number
      }>
      individuels: Readonly<{
        proportion: number
        total: number
      }>
      total: number
    }>
    activites: Readonly<{
      collectifs: Readonly<{
        participants: number
        proportion: number
        total: number
      }>
      demarches?: Readonly<{
        proportion: number
        total: number
      }>
      individuels: Readonly<{
        proportion: number
        total: number
      }>
      total: number
    }>
    beneficiaires: Readonly<{
      anonymes: number
      nouveaux: number
      suivis: number
      total: number
    }>
  }>
}>

type StatistiquesItem = Readonly<{
  count: number
  label: string
  proportion: number
  value: string
}>
