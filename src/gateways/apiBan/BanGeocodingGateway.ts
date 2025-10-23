/**
 * Gateway pour le géocodage d'adresses via l'API BAN (Base Adresse Nationale)
 * Documentation : https://adresse.data.gouv.fr/api-doc/adresse
 */

export interface BanGeocodingGateway {
  geocoder(params: GeocodageParams): Promise<AdresseGeocodeReadModel | null>
}

export type GeocodageParams = Readonly<{
  adresse: string
  codeInsee?: string
  latitude?: number
  longitude?: number
}>

export type AdresseGeocodeReadModel = Readonly<{
  banClefInterop: string
  banCodeBan: null | string
  banCodeInsee: string
  banCodePostal: string
  banLatitude: number
  banLongitude: number
  banNomCommune: string
  banNomVoie: string
  banNumeroVoie: null | number
  banRepetition: null | string
  score: number
  type: 'housenumber' | 'locality' | 'street'
}>
