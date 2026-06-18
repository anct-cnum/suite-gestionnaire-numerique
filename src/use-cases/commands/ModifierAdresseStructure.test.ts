import { describe, expect, it } from 'vitest'

import { ModifierAdresseStructure } from './ModifierAdresseStructure'
import { AdresseARattacher, ModifierAdresseStructureRepository, NomActuelStructure } from './shared/StructureRepository'
import { AdresseGeocodeReadModel, BanGeocodingGateway, GeocodageParams } from '@/gateways/apiBan/BanGeocodingGateway'

describe('modifier l’adresse d’une structure', () => {
  it('géocode l’adresse puis re-pointe la structure sur l’adresse correspondante', async () => {
    // GIVEN
    const geocoder = geocodage(adresseGeocodee())
    const repository = repositoryStub({ denominationAntenne: 'antenne actuelle' })

    // WHEN
    const result = await new ModifierAdresseStructure({ geocoder }, repository).handle({
      adresse: '14 rue Louis Talamoni, Champigny',
      structureId: 978,
    })

    // THEN
    expect(result).toBe('OK')
    expect(geocoder).toHaveBeenCalledWith({ adresse: '14 rue Louis Talamoni, Champigny' })
    expect(repository.rattacherAdresse).toHaveBeenCalledWith(978, {
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

  it('refuse de modifier l’adresse d’une structure canonique (denomination_antenne null)', async () => {
    // GIVEN
    const geocoder = geocodage(adresseGeocodee())
    const repository = repositoryStub({ denominationAntenne: null })

    // WHEN
    const result = await new ModifierAdresseStructure({ geocoder }, repository).handle({
      adresse: '14 rue Louis Talamoni',
      structureId: 978,
    })

    // THEN
    expect(result).toBe('structureCanoniqueNonModifiable')
    expect(geocoder).not.toHaveBeenCalled()
    expect(repository.rattacherAdresse).not.toHaveBeenCalled()
  })

  it('renvoie une erreur quand la structure est introuvable', async () => {
    // GIVEN
    const repository = repositoryStub(null)

    // WHEN
    const result = await new ModifierAdresseStructure({ geocoder: geocodage(adresseGeocodee()) }, repository).handle({
      adresse: '14 rue Louis Talamoni',
      structureId: 0,
    })

    // THEN
    expect(result).toBe('structureIntrouvable')
  })

  it('renvoie une erreur quand l’adresse n’est pas géocodable', async () => {
    // GIVEN
    const geocoder = geocodage(null)
    const repository = repositoryStub({ denominationAntenne: 'antenne actuelle' })

    // WHEN
    const result = await new ModifierAdresseStructure({ geocoder }, repository).handle({
      adresse: 'azertyuiop',
      structureId: 978,
    })

    // THEN
    expect(result).toBe('adresseIntrouvable')
    expect(repository.rattacherAdresse).not.toHaveBeenCalled()
  })
})

function geocodage(resultat: AdresseGeocodeReadModel | null): BanGeocodingGateway['geocoder'] {
  return vi.fn<(params: GeocodageParams) => Promise<AdresseGeocodeReadModel | null>>().mockResolvedValue(resultat)
}

function repositoryStub(nomActuel: NomActuelStructure | null): ModifierAdresseStructureRepository {
  return {
    lireNomStructure: vi.fn<(structureId: number) => Promise<NomActuelStructure | null>>().mockResolvedValue(nomActuel),
    rattacherAdresse: vi
      .fn<(structureId: number, adresse: AdresseARattacher) => Promise<void>>()
      .mockResolvedValue(undefined),
  }
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
