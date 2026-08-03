'use server'

import { ApiBanGeocodingGateway } from '@/gateways/apiBan/ApiBanGeocodingGateway'

// Lecture seule : propose des adresses BAN pour l'autocomplétion. L'adresse choisie est
// re-géocodée côté serveur au moment de l'enregistrement (aucune écriture ici).
export async function rechercherAdressesAction(recherche: string): Promise<ReadonlyArray<AdresseProposee>> {
  if (recherche.trim().length < 3) {
    return []
  }

  const resultats = await new ApiBanGeocodingGateway().rechercher(recherche)

  return resultats.map((resultat) => {
    const numero = resultat.banNumeroVoie === null ? '' : `${resultat.banNumeroVoie}${resultat.banRepetition ?? ''} `
    return {
      label: `${numero}${resultat.banNomVoie}, ${resultat.banCodePostal} ${resultat.banNomCommune}`,
    }
  })
}

type AdresseProposee = Readonly<{
  label: string
}>
