import {
  AdresseGeocodeReadModel,
  BanGeocodingGateway,
  GeocodageParams,
} from './BanGeocodingGateway'
import { reportLoaderError } from '../shared/sentryErrorReporter'

/**
 * Implémentation du gateway de géocodage via l'API BAN
 * URL de l'API : https://data.geopf.fr/geocodage/search
 */
export class ApiBanGeocodingGateway implements BanGeocodingGateway {
  private readonly apiUrl = 'https://data.geopf.fr/geocodage/search'
  private readonly headers = {
    'User-Agent': 'ANCT-geocoding/1.0 (+contact: data@anct.gouv.fr)',
  }
  private readonly scoreMinimum = 0.6

  async geocoder(params: GeocodageParams): Promise<AdresseGeocodeReadModel | null> {
    try {
      const urlParams = new URLSearchParams({
        autocomplete: '0',
        limit: '1',
        q: params.adresse.trim(), // eslint-disable-line id-length -- 'q' est le paramètre standard de l'API BAN
      })

      if (params.codeInsee !== undefined) {
        urlParams.set('citycode', params.codeInsee)
      }

      if (params.latitude !== undefined && params.longitude !== undefined) {
        urlParams.set('lat', params.latitude.toString())
        urlParams.set('lon', params.longitude.toString())
      }

      const response = await this.recupererAvecTentatives(
        `${this.apiUrl}?${urlParams.toString()}`
      )

      const donnees = await this.gererReponse(response)

      return this.traiterReponseApi(donnees)
    } catch (error: unknown) {
      reportLoaderError(error, 'ApiBanGeocodingGateway', {
        operation: 'geocoder',
        params,
      })
      return null
    }
  }

  private async gererReponse(reponse: Response): Promise<BanApiResponse> {
    if (!reponse.ok) {
      const texteErreur = await reponse.text()

      if (reponse.status === 429) {
        throw new Error('Trop de requêtes. Veuillez réessayer dans quelques instants.')
      }

      throw new Error(`Erreur API BAN: ${reponse.status} - ${texteErreur}`)
    }

    return (await reponse.json()) as BanApiResponse
  }

  private async recupererAvecTentatives(url: string): Promise<Response> {
    let reponse: Response | undefined
    let derniereErreur: Error | null = null

    // Retry jusqu'à 3 fois en cas d'erreur réseau
    for (let tentative = 1; tentative <= 3; tentative += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        reponse = await fetch(url, {
          headers: this.headers,
          // Timeout de 10 secondes
          signal: AbortSignal.timeout(10000),
        })

        // Si rate limited (429), attendre avant de retry
        if (reponse.status === 429) {
          const retryAfter = reponse.headers.get('Retry-After')
          const waitTime = retryAfter === null ? 5000 : Number.parseInt(retryAfter, 10) * 1000

          // eslint-disable-next-line no-await-in-loop
          await new Promise(resolve => {
            setTimeout(resolve, waitTime)
          })
        } else {
          break
        }
      } catch (erreur) {
        derniereErreur = erreur as Error

        // Si c'est la dernière tentative, on lance l'erreur
        if (tentative === 3) {
          throw new Error(
            `Échec de connexion à l'API BAN après 3 tentatives: ${derniereErreur.message}`
          )
        }

        // Attente avant retry (2s, puis 4s)
        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => {
          setTimeout(resolve, tentative * 2000)
        })
      }
    }

    if (!reponse) {
      throw new Error(
        `Échec de connexion à l'API BAN après 3 tentatives: ${derniereErreur?.message}`
      )
    }

    return reponse
  }

  private traiterReponseApi(donnees: BanApiResponse): AdresseGeocodeReadModel | null {
    if ( donnees.features.length === 0) {
      return null
    }

    const feature = donnees.features[0]
    const properties = feature.properties
    const coordinates = feature.geometry.coordinates

    // Vérifier le score minimum
    if (properties.score < this.scoreMinimum) {
      return null
    }

    // Vérifier le type d'adresse (accepter housenumber, street, locality)
    if (
      properties.type !== 'housenumber' &&
      properties.type !== 'street' &&
      properties.type !== 'locality'
    ) {
      return null
    }

    // Parser le numéro de voie pour extraire le numéro et la répétition
    let numeroVoie: null | number = null
    let repetition: null | string = null

    if (properties.housenumber !== undefined) {
      const match = /^(\d+)([a-zA-Z]*)$/.exec(properties.housenumber.trim())
      if (match) {
        numeroVoie = Number.parseInt(match[1], 10)
        repetition = match[2] || null
      }
    }

    // Déterminer le nom de voie selon le type
    let nomVoie: string
    if (properties.type === 'housenumber' || properties.type === 'street') {
      nomVoie = properties.street ?? ''
    } else {
      nomVoie = properties.locality ?? ''
    }

    return {
      banClefInterop: properties.id,
      banCodeBan: properties.banId ?? null,
      banCodeInsee: properties.citycode,
      banCodePostal: properties.postcode,
      banLatitude: coordinates[1],
      banLongitude: coordinates[0],
      banNomCommune: properties.city,
      banNomVoie: nomVoie,
      banNumeroVoie: numeroVoie,
      banRepetition: repetition,
      score: properties.score,
      type: properties.type,
    }
  }
}

// Types pour la réponse de l'API BAN
type BanApiResponse = Readonly<{
  features: ReadonlyArray<BanFeature>
  type: 'FeatureCollection'
}>

type BanFeature = Readonly<{
  geometry: Readonly<{
    coordinates: readonly [number, number]
    type: 'Point'
  }>
  properties: BanProperties
  type: 'Feature'
}>

type BanProperties = Readonly<{
  banId: null | string
  city: string
  citycode: string
  housenumber?: string
  id: string
  locality?: string
  name: string
  postcode: string
  score: number
  street?: string
  type: 'housenumber' | 'locality' | 'municipality' | 'street'
}>
