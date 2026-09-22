import { describe, expect, it } from 'vitest'

import {
  CriteresLieuxSimilaires,
  LieuInclusionSimilaireReadModel,
  LieuxInclusionSimilairesLoader,
  RechercherLieuxInclusionSimilaires,
} from './RechercherLieuxInclusionSimilaires'
import { AdresseGeocodeReadModel, BanGeocodingGateway } from '@/gateways/apiBan/BanGeocodingGateway'

describe('rechercher les lieux d’inclusion similaires', () => {
  it('géocode l’adresse saisie pour chercher par clef BAN et par commune, puis délègue au loader', async () => {
    // GIVEN
    let spiedCriteres: CriteresLieuxSimilaires | null = null
    const loader: LieuxInclusionSimilairesLoader = {
      async rechercher(criteres) {
        spiedCriteres = criteres
        return Promise.resolve([lieuSimilaire])
      },
    }

    // WHEN
    const lieux = await new RechercherLieuxInclusionSimilaires(banGeocodingGateway(adresseGeocodee), loader).handle({
      adresse: '1 rue de la Paix 75001 Paris',
      nom: 'Ma médiathèque',
      siret: '12345678901234',
    })

    // THEN
    expect(spiedCriteres).toStrictEqual({
      clefInterop: '75101_7141_00001',
      codeInsee: '75101',
      nom: 'Ma médiathèque',
      siret: '12345678901234',
    })
    expect(lieux).toStrictEqual([lieuSimilaire])
  })

  it('sans adresse ni SIRET, cherche par nom seul', async () => {
    // GIVEN
    let spiedCriteres: CriteresLieuxSimilaires | null = null
    let geocodeAppele = false
    const loader: LieuxInclusionSimilairesLoader = {
      async rechercher(criteres) {
        spiedCriteres = criteres
        return Promise.resolve([])
      },
    }
    const gateway: BanGeocodingGateway = {
      async geocoder() {
        geocodeAppele = true
        return Promise.resolve(null)
      },
    }

    // WHEN
    await new RechercherLieuxInclusionSimilaires(gateway, loader).handle({ nom: 'Ma médiathèque' })

    // THEN
    expect(geocodeAppele).toBe(false)
    expect(spiedCriteres).toStrictEqual({ clefInterop: null, codeInsee: null, nom: 'Ma médiathèque', siret: null })
  })
})

const lieuSimilaire: LieuInclusionSimilaireReadModel = {
  adresse: '1 Rue de la Paix 75001 Paris',
  estLieuCoop: false,
  id: '42',
  motif: 'adresse',
  nom: 'Médiathèque',
  siret: null,
}

const adresseGeocodee: AdresseGeocodeReadModel = {
  banClefInterop: '75101_7141_00001',
  banCodeBan: null,
  banCodeInsee: '75101',
  banCodePostal: '75001',
  banLatitude: 48.868,
  banLongitude: 2.331,
  banNomCommune: 'Paris',
  banNomVoie: 'Rue de la Paix',
  banNumeroVoie: 1,
  banRepetition: null,
  score: 0.9,
  type: 'housenumber',
}

function banGeocodingGateway(resultat: AdresseGeocodeReadModel | null): BanGeocodingGateway {
  return {
    async geocoder() {
      return Promise.resolve(resultat)
    },
  }
}
