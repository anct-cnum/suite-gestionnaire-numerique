import { describe, expect, it } from 'vitest'

import {
  CriteresLieuxSimilaires,
  LieuInclusionSimilaireReadModel,
  LieuxInclusionSimilairesLoader,
  RechercherLieuxInclusionSimilaires,
} from './RechercherLieuxInclusionSimilaires'
import { AdresseGeocodeReadModel, BanGeocodingGateway } from '@/gateways/apiBan/BanGeocodingGateway'

describe('rechercher les lieux d’inclusion déjà déclarés à une adresse', () => {
  it('géocode l’adresse saisie puis cherche les lieux portant la même clef BAN', async () => {
    // GIVEN
    let spiedCriteres: CriteresLieuxSimilaires | null = null
    const loader: LieuxInclusionSimilairesLoader = {
      async rechercher(criteres) {
        spiedCriteres = criteres
        return Promise.resolve([lieuDejaDeclare])
      },
    }

    // WHEN
    const lieux = await new RechercherLieuxInclusionSimilaires(banGeocodingGateway(adresseGeocodee), loader).handle({
      adresse: '1 rue de la Paix 75001 Paris',
    })

    // THEN
    expect(spiedCriteres).toStrictEqual({ clefInterop: '75101_7141_00001' })
    expect(lieux).toStrictEqual([lieuDejaDeclare])
  })

  it('sans adresse, ne géocode rien et ne cherche rien', async () => {
    // GIVEN
    let geocodeAppele = false
    let loaderAppele = false
    const gateway: BanGeocodingGateway = {
      async geocoder() {
        geocodeAppele = true
        return Promise.resolve(null)
      },
    }
    const loader: LieuxInclusionSimilairesLoader = {
      async rechercher() {
        loaderAppele = true
        return Promise.resolve([])
      },
    }

    // WHEN
    const lieux = await new RechercherLieuxInclusionSimilaires(gateway, loader).handle({ adresse: '' })

    // THEN
    expect(geocodeAppele).toBe(false)
    expect(loaderAppele).toBe(false)
    expect(lieux).toStrictEqual([])
  })

  it('quand l’adresse n’est pas reconnue par la BAN, ne propose aucun lieu', async () => {
    // GIVEN
    let loaderAppele = false
    const loader: LieuxInclusionSimilairesLoader = {
      async rechercher() {
        loaderAppele = true
        return Promise.resolve([lieuDejaDeclare])
      },
    }

    // WHEN
    const lieux = await new RechercherLieuxInclusionSimilaires(banGeocodingGateway(null), loader).handle({
      adresse: 'une adresse introuvable',
    })

    // THEN
    expect(loaderAppele).toBe(false)
    expect(lieux).toStrictEqual([])
  })
})

const lieuDejaDeclare: LieuInclusionSimilaireReadModel = {
  adresse: '1 Rue de la Paix 75001 Paris',
  id: '42',
  nom: 'Médiathèque',
  nombrePersonnesRattachees: 3,
  siret: null,
  typologies: ['BIB'],
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
