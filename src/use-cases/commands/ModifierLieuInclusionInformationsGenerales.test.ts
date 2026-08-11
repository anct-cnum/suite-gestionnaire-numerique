import { beforeEach, describe, expect, it } from 'vitest'

import { ModifierLieuInclusionInformationsGenerales } from './ModifierLieuInclusionInformationsGenerales'
import {
  UpdateLieuInclusionInformationsGeneralesData,
  UpdateLieuInclusionInformationsGeneralesRepository,
} from './shared/LieuInclusionRepository'
import { AdresseGeocodeReadModel, BanGeocodingGateway, GeocodageParams } from '@/gateways/apiBan/BanGeocodingGateway'
import { epochTime } from '@/shared/testHelper'

describe('modifier les informations générales d’un lieu d’inclusion', () => {
  beforeEach(() => {
    spiedGeocodageParams = null
    spiedUpdateData = null
    geocodeResultat = adresseGeocodee
  })

  it('avec SIRET, quand l’adresse SIRENE est trouvée dans la BAN, alors le lieu est mis à jour avec l’adresse enrichie', async () => {
    // GIVEN
    const modifier = new ModifierLieuInclusionInformationsGenerales(
      banGeocodingGateway,
      lieuInclusionRepository,
      epochTime
    )

    // WHEN
    const result = await modifier.handle({
      modification: { avecSiret: { entreprise, siret: '12345678901234', typologies: ['BIB'] } },
      structureId: '42',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedGeocodageParams).toStrictEqual({ adresse: '1 rue de la Paix 75001 Paris', codeInsee: '75101' })
    expect(spiedUpdateData?.adresseEnrichie).toStrictEqual(adresseGeocodee)
    expect(spiedUpdateData?.adresseSirene).toBeNull()
    expect(spiedUpdateData?.complementAdresse).toBeNull()
    expect(spiedUpdateData?.date).toStrictEqual(epochTime)
    expect(spiedUpdateData?.itinerance).toBeUndefined()
    expect(spiedUpdateData?.nom).toBe('Ma Structure')
    expect(spiedUpdateData?.siret).toBe('12345678901234')
    expect(spiedUpdateData?.structureUid.state.value).toBe(42)
    expect(spiedUpdateData?.typologies).toStrictEqual(['BIB'])
  })

  it('avec SIRET, quand l’adresse SIRENE est introuvable dans la BAN, alors le lieu est mis à jour avec les composants SIRENE', async () => {
    // GIVEN
    geocodeResultat = null
    const modifier = new ModifierLieuInclusionInformationsGenerales(
      banGeocodingGateway,
      lieuInclusionRepository,
      epochTime
    )

    // WHEN
    const result = await modifier.handle({
      modification: { avecSiret: { entreprise, siret: '12345678901234', typologies: ['BIB'] } },
      structureId: '42',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUpdateData?.adresseEnrichie).toBeNull()
    expect(spiedUpdateData?.adresseSirene).toStrictEqual({
      codeInsee: '75101',
      codePostal: '75001',
      commune: 'Paris',
      nomVoie: 'rue de la Paix',
      numeroVoie: 1,
    })
  })

  it('avec SIRET, quand le numéro de voie SIRENE est vide, alors il est enregistré comme nul', async () => {
    // GIVEN
    geocodeResultat = null
    const modifier = new ModifierLieuInclusionInformationsGenerales(
      banGeocodingGateway,
      lieuInclusionRepository,
      epochTime
    )

    // WHEN
    await modifier.handle({
      modification: {
        avecSiret: { entreprise: { ...entreprise, numeroVoie: '' }, siret: '12345678901234', typologies: ['BIB'] },
      },
      structureId: '42',
    })

    // THEN
    expect(spiedUpdateData?.adresseSirene?.numeroVoie).toBeNull()
  })

  it('sans SIRET, quand l’adresse saisie est trouvée dans la BAN, alors le lieu est mis à jour avec la saisie manuelle', async () => {
    // GIVEN
    const modifier = new ModifierLieuInclusionInformationsGenerales(
      banGeocodingGateway,
      lieuInclusionRepository,
      epochTime
    )

    // WHEN
    const result = await modifier.handle({
      modification: {
        sansSiret: {
          adresse: '1 rue de la Paix, 75001 Paris',
          complementAdresse: 'Bâtiment B',
          itinerant: true,
          nom: 'Mon Lieu',
          typologies: ['ASSO', 'CCAS'],
        },
      },
      structureId: '42',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedGeocodageParams).toStrictEqual({ adresse: '1 rue de la Paix, 75001 Paris' })
    expect(spiedUpdateData?.adresseEnrichie).toStrictEqual(adresseGeocodee)
    expect(spiedUpdateData?.adresseSirene).toBeNull()
    expect(spiedUpdateData?.complementAdresse).toBe('Bâtiment B')
    expect(spiedUpdateData?.itinerance).toStrictEqual(['Itinérant'])
    expect(spiedUpdateData?.nom).toBe('Mon Lieu')
    expect(spiedUpdateData?.siret).toBeNull()
    expect(spiedUpdateData?.typologies).toStrictEqual(['ASSO', 'CCAS'])
  })

  it('sans SIRET, quand le lieu n’est pas itinérant et le complément vide, alors l’itinérance est fixe et le complément nul', async () => {
    // GIVEN
    const modifier = new ModifierLieuInclusionInformationsGenerales(
      banGeocodingGateway,
      lieuInclusionRepository,
      epochTime
    )

    // WHEN
    await modifier.handle({
      modification: {
        sansSiret: {
          adresse: '1 rue de la Paix, 75001 Paris',
          complementAdresse: '',
          itinerant: false,
          nom: 'Mon Lieu',
          typologies: ['ASSO'],
        },
      },
      structureId: '42',
    })

    // THEN
    expect(spiedUpdateData?.complementAdresse).toBeNull()
    expect(spiedUpdateData?.itinerance).toStrictEqual(['Fixe'])
  })

  it('sans SIRET, quand l’adresse saisie est introuvable dans la BAN, alors la modification est refusée', async () => {
    // GIVEN
    geocodeResultat = null
    const modifier = new ModifierLieuInclusionInformationsGenerales(
      banGeocodingGateway,
      lieuInclusionRepository,
      epochTime
    )

    // WHEN
    const result = await modifier.handle({
      modification: {
        sansSiret: {
          adresse: 'adresse inconnue',
          complementAdresse: '',
          itinerant: false,
          nom: 'Mon Lieu',
          typologies: ['ASSO'],
        },
      },
      structureId: '42',
    })

    // THEN
    expect(result).toBe('adresseIntrouvable')
    expect(spiedUpdateData).toBeNull()
  })
})

let spiedGeocodageParams: GeocodageParams | null
let spiedUpdateData: null | UpdateLieuInclusionInformationsGeneralesData
let geocodeResultat: AdresseGeocodeReadModel | null

const adresseGeocodee: AdresseGeocodeReadModel = {
  banClefInterop: '75101_7141_00001',
  banCodeBan: 'code-ban',
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

const entreprise = {
  adresse: '1 rue de la Paix 75001 Paris',
  codeInsee: '75101',
  codePostal: '75001',
  commune: 'Paris',
  denomination: 'Ma Structure',
  nomVoie: 'rue de la Paix',
  numeroVoie: '1',
}

const banGeocodingGateway: BanGeocodingGateway = {
  async geocoder(params: GeocodageParams): Promise<AdresseGeocodeReadModel | null> {
    spiedGeocodageParams = params
    return Promise.resolve(geocodeResultat)
  },
}

const lieuInclusionRepository: UpdateLieuInclusionInformationsGeneralesRepository = {
  async updateInformationsGenerales(data: UpdateLieuInclusionInformationsGeneralesData): Promise<void> {
    spiedUpdateData = data
    return Promise.resolve()
  },
}
