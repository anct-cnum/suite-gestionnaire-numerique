import { describe, expect, it } from 'vitest'

import { ModifierAdresseStructure } from './ModifierAdresseStructure'
import { AdresseARattacher, ModifierAdresseStructureRepository } from './shared/StructureRepository'
import { AdresseGeocodeReadModel, BanGeocodingGateway, GeocodageParams } from '@/gateways/apiBan/BanGeocodingGateway'

describe('modifier l’adresse d’une structure', () => {
  it('géocode l’adresse puis re-pointe la structure sur l’adresse correspondante', async () => {
    // GIVEN
    const geocoder = geocodage(adresseGeocodee())
    const rattacherAdresse = rattachement()

    // WHEN
    const result = await new ModifierAdresseStructure({ geocoder }, { rattacherAdresse }).handle({
      adresse: '14 rue Louis Talamoni, Champigny',
      structureId: 978,
    })

    // THEN
    expect(result).toBe('OK')
    expect(geocoder).toHaveBeenCalledWith({ adresse: '14 rue Louis Talamoni, Champigny' })
    expect(rattacherAdresse).toHaveBeenCalledWith(978, {
      clefInterop: '94017_aaaa',
      codeBan: null,
      codeInsee: '94017',
      codePostal: '94500',
      latitude: 48.81,
      longitude: 2.51,
      nomCommune: 'Champigny-sur-Marne',
      nomVoie: 'Rue Louis Talamoni',
      numeroVoie: 14,
      repetition: null,
    })
  })

  it('renvoie une erreur quand l’adresse n’est pas géocodable', async () => {
    // GIVEN
    const geocoder = geocodage(null)
    const rattacherAdresse = rattachement()

    // WHEN
    const result = await new ModifierAdresseStructure({ geocoder }, { rattacherAdresse }).handle({
      adresse: 'azertyuiop',
      structureId: 978,
    })

    // THEN
    expect(result).toBe('adresseIntrouvable')
    expect(rattacherAdresse).not.toHaveBeenCalled()
  })
})

function geocodage(resultat: AdresseGeocodeReadModel | null): BanGeocodingGateway['geocoder'] {
  return vi.fn<(params: GeocodageParams) => Promise<AdresseGeocodeReadModel | null>>().mockResolvedValue(resultat)
}

function rattachement(): ModifierAdresseStructureRepository['rattacherAdresse'] {
  return vi.fn<(structureId: number, adresse: AdresseARattacher) => Promise<void>>().mockResolvedValue(undefined)
}

function adresseGeocodee(): AdresseGeocodeReadModel {
  return {
    banClefInterop: '94017_aaaa',
    banCodeBan: null,
    banCodeInsee: '94017',
    banCodePostal: '94500',
    banLatitude: 48.81,
    banLongitude: 2.51,
    banNomCommune: 'Champigny-sur-Marne',
    banNomVoie: 'Rue Louis Talamoni',
    banNumeroVoie: 14,
    banRepetition: null,
    score: 0.95,
    type: 'housenumber',
  }
}
