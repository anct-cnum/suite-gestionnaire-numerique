'use server'

import { ApiBanGeocodingGateway } from '@/gateways/apiBan/ApiBanGeocodingGateway'

export async function previsualiserAdresseAction(adresse: string): Promise<AdresseApercu | null> {
  if (adresse.trim() === '') {
    return null
  }

  // Lecture seule : on géocode la saisie via la BAN pour la faire valider à l'utilisateur avant
  // toute écriture. Le re-pointage (mutation) reste géré par modifierAdresseStructureAction.
  const geocode = await new ApiBanGeocodingGateway().geocoder({ adresse })
  if (geocode === null) {
    return null
  }

  const numero = geocode.banNumeroVoie === null ? '' : `${geocode.banNumeroVoie} `

  return {
    label: `${numero}${geocode.banNomVoie}, ${geocode.banCodePostal} ${geocode.banNomCommune}`,
    score: geocode.score,
  }
}

export type AdresseApercu = Readonly<{
  label: string
  score: number
}>
