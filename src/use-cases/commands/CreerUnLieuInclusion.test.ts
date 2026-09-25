import { beforeEach, describe, expect, it } from 'vitest'

import { CreerUnLieuInclusion } from './CreerUnLieuInclusion'
import { CreerLieuInclusionData, CreerLieuInclusionRepository } from './shared/LieuInclusionRepository'
import { AdresseGeocodeReadModel, BanGeocodingGateway, GeocodageParams } from '@/gateways/apiBan/BanGeocodingGateway'
import { epochTime } from '@/shared/testHelper'

describe('créer un lieu d’inclusion', () => {
  beforeEach(() => {
    spiedGeocodageParams = null
    spiedCreerData = null
    geocodeResultat = adresseGeocodee
  })

  it('avec SIRET et adresse trouvée dans la BAN, crée un lieu fixe signé MIN à partir de l’entreprise', async () => {
    // WHEN
    const result = await creerUnLieuInclusion().handle({
      creation: { avecSiret: { entreprise, siret: '12345678901234', typologies: ['ASSO'] } },
      visiblePourCartographie: true,
    })

    // THEN
    expect(spiedGeocodageParams).toStrictEqual({ adresse: entreprise.adresse, codeInsee: '75101' })
    expect(spiedCreerData).toStrictEqual({
      adresseEnrichie: adresseGeocodee,
      adresseSirene: null,
      complementAdresse: null,
      date: epochTime,
      itinerance: ['Fixe'],
      nom: 'Ma Structure',
      siret: '12345678901234',
      typologies: ['ASSO'],
      visiblePourCartographie: true,
    })
    expect(result).toStrictEqual({ lieuId: 4242, visibilitePourCartographieForcee: false })
  })

  it('avec SIRET et adresse absente de la BAN, se replie sur les composants SIRENE complets, la visibilité choisie est respectée', async () => {
    // GIVEN
    geocodeResultat = null

    // WHEN
    const result = await creerUnLieuInclusion().handle({
      creation: {
        avecSiret: { entreprise: { ...entreprise, numeroVoie: '' }, siret: '12345678901234', typologies: ['ASSO'] },
      },
      visiblePourCartographie: false,
    })

    // THEN
    expect(spiedCreerData?.adresseEnrichie).toBeNull()
    expect(spiedCreerData?.adresseSirene).toStrictEqual({
      codeInsee: '75101',
      codePostal: '75001',
      commune: 'Paris',
      nomVoie: 'rue de la Paix',
      numeroVoie: null,
    })
    expect(spiedCreerData?.visiblePourCartographie).toBe(false)
    expect(result).toStrictEqual({ lieuId: 4242, visibilitePourCartographieForcee: false })
  })

  it('avec SIRET, adresse absente de la BAN et visibilité demandée, force la visibilité à false et le signale', async () => {
    // GIVEN
    geocodeResultat = null

    // WHEN
    const result = await creerUnLieuInclusion().handle({
      creation: {
        avecSiret: { entreprise: { ...entreprise, numeroVoie: '' }, siret: '12345678901234', typologies: ['ASSO'] },
      },
      visiblePourCartographie: true,
    })

    // THEN
    expect(spiedCreerData?.visiblePourCartographie).toBe(false)
    expect(result).toStrictEqual({ lieuId: 4242, visibilitePourCartographieForcee: true })
  })

  it('avec SIRET, adresse absente de la BAN et composants SIRENE incomplets, refuse : un lieu sans adresse n’est ni cartographiable ni dédoublonnable', async () => {
    // GIVEN
    geocodeResultat = null

    // WHEN
    const result = await creerUnLieuInclusion().handle({
      creation: {
        avecSiret: { entreprise: { ...entreprise, codeInsee: '' }, siret: '12345678901234', typologies: ['ASSO'] },
      },
      visiblePourCartographie: false,
    })

    // THEN
    expect(result).toBe('adresseIntrouvable')
    expect(spiedCreerData).toBeNull()
  })

  it('sans SIRET et adresse trouvée, crée le lieu tel que saisi, itinérant, sans complément vide', async () => {
    // WHEN
    const result = await creerUnLieuInclusion().handle({
      creation: {
        sansSiret: {
          adresse: '1 rue de la Paix 75001 Paris',
          complementAdresse: '',
          itinerant: true,
          nom: 'Mon lieu',
          typologies: ['BIB'],
        },
      },
      visiblePourCartographie: false,
    })

    // THEN
    expect(spiedGeocodageParams).toStrictEqual({ adresse: '1 rue de la Paix 75001 Paris' })
    expect(spiedCreerData).toStrictEqual({
      adresseEnrichie: adresseGeocodee,
      adresseSirene: null,
      complementAdresse: null,
      date: epochTime,
      itinerance: ['Itinérant'],
      nom: 'Mon lieu',
      siret: null,
      typologies: ['BIB'],
      visiblePourCartographie: false,
    })
    expect(result).toStrictEqual({ lieuId: 4242, visibilitePourCartographieForcee: false })
  })

  it('sans SIRET, un lieu non itinérant est fixe et son complément d’adresse est conservé', async () => {
    // WHEN
    await creerUnLieuInclusion().handle({
      creation: {
        sansSiret: {
          adresse: '1 rue de la Paix 75001 Paris',
          complementAdresse: 'Bât. B',
          itinerant: false,
          nom: 'Mon lieu',
          typologies: ['BIB'],
        },
      },
      visiblePourCartographie: true,
    })

    // THEN
    expect(spiedCreerData?.itinerance).toStrictEqual(['Fixe'])
    expect(spiedCreerData?.complementAdresse).toBe('Bât. B')
    expect(spiedCreerData?.visiblePourCartographie).toBe(true)
  })

  it('sans SIRET et adresse introuvable dans la BAN, refuse sans rien créer', async () => {
    // GIVEN
    geocodeResultat = null

    // WHEN
    const result = await creerUnLieuInclusion().handle({
      creation: {
        sansSiret: {
          adresse: 'nulle part',
          complementAdresse: '',
          itinerant: false,
          nom: 'Mon lieu',
          typologies: ['BIB'],
        },
      },
      visiblePourCartographie: true,
    })

    // THEN
    expect(result).toBe('adresseIntrouvable')
    expect(spiedCreerData).toBeNull()
  })
})

let spiedGeocodageParams: GeocodageParams | null
let spiedCreerData: CreerLieuInclusionData | null
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

const lieuInclusionRepository: CreerLieuInclusionRepository = {
  async creer(data: CreerLieuInclusionData): Promise<number> {
    spiedCreerData = data
    return Promise.resolve(4242)
  },
}

function creerUnLieuInclusion(): CreerUnLieuInclusion {
  return new CreerUnLieuInclusion(banGeocodingGateway, lieuInclusionRepository, epochTime)
}
