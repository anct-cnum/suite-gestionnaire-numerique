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

  it('avec un SIRET et une adresse trouvée dans la BAN, crée le lieu tel que saisi', async () => {
    // WHEN
    const result = await creerUnLieuInclusion().handle({
      creation: {
        ...creationSaisie,
        complementAdresse: 'Bât. B',
        itinerant: true,
        repliSirene,
        siret: '12345678901234',
      },
      visiblePourCartographie: true,
    })

    // THEN
    // Le code INSEE du SIRET aide le géocodage tant que l'adresse n'a pas été retouchée.
    expect(spiedGeocodageParams).toStrictEqual({ adresse: adresseDuSiret, codeInsee: '75101' })
    expect(spiedCreerData).toStrictEqual({
      adresseEnrichie: adresseGeocodee,
      adresseSirene: null,
      complementAdresse: 'Bât. B',
      date: epochTime,
      itinerance: ['Itinérant'],
      nom: 'Mon lieu',
      siret: '12345678901234',
      typologies: ['ASSO'],
      visiblePourCartographie: true,
    })
    expect(result).toStrictEqual({ lieuId: 4242, visibilitePourCartographieForcee: false })
  })

  it('avec un SIRET et une adresse absente de la BAN, se replie sur les composants SIRENE complets, la visibilité choisie est respectée', async () => {
    // GIVEN
    geocodeResultat = null

    // WHEN
    const result = await creerUnLieuInclusion().handle({
      creation: {
        ...creationSaisie,
        repliSirene: { ...repliSirene, numeroVoie: '' },
        siret: '12345678901234',
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

  it('avec un SIRET, une adresse absente de la BAN et la visibilité demandée, force la visibilité à false et le signale', async () => {
    // GIVEN
    geocodeResultat = null

    // WHEN
    const result = await creerUnLieuInclusion().handle({
      creation: { ...creationSaisie, repliSirene, siret: '12345678901234' },
      visiblePourCartographie: true,
    })

    // THEN
    expect(spiedCreerData?.visiblePourCartographie).toBe(false)
    expect(result).toStrictEqual({ lieuId: 4242, visibilitePourCartographieForcee: true })
  })

  it('avec un SIRET, une adresse absente de la BAN et des composants SIRENE incomplets, refuse : un lieu sans adresse n’est ni cartographiable ni dédoublonnable', async () => {
    // GIVEN
    geocodeResultat = null

    // WHEN
    const result = await creerUnLieuInclusion().handle({
      creation: { ...creationSaisie, repliSirene: { ...repliSirene, codeInsee: '' }, siret: '12345678901234' },
      visiblePourCartographie: false,
    })

    // THEN
    expect(result).toBe('adresseIntrouvable')
    expect(spiedCreerData).toBeNull()
  })

  it('avec un SIRET dont l’adresse a été retouchée, ne se replie pas sur les composants SIRENE : ils ne décrivent plus le lieu', async () => {
    // GIVEN
    geocodeResultat = null

    // WHEN
    const result = await creerUnLieuInclusion().handle({
      creation: {
        ...creationSaisie,
        adresse: '2 avenue de l’Opéra 75001 Paris',
        repliSirene,
        siret: '12345678901234',
      },
      visiblePourCartographie: false,
    })

    // THEN
    expect(spiedGeocodageParams).toStrictEqual({ adresse: '2 avenue de l’Opéra 75001 Paris' })
    expect(result).toBe('adresseIntrouvable')
    expect(spiedCreerData).toBeNull()
  })

  it('sans SIRET et adresse trouvée, crée le lieu tel que saisi, itinérant, sans complément vide', async () => {
    // WHEN
    const result = await creerUnLieuInclusion().handle({
      creation: { ...creationSaisie, itinerant: true, typologies: ['BIB'] },
      visiblePourCartographie: false,
    })

    // THEN
    expect(spiedGeocodageParams).toStrictEqual({ adresse: adresseDuSiret })
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
      creation: { ...creationSaisie, complementAdresse: 'Bât. B' },
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
      creation: { ...creationSaisie, adresse: 'nulle part' },
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

const adresseDuSiret = '1 rue de la Paix 75001 Paris'

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

// Adresse du SIRET résolue côté serveur, conservée pour le cas où elle est soumise telle quelle.
const repliSirene = {
  adresse: adresseDuSiret,
  codeInsee: '75101',
  codePostal: '75001',
  commune: 'Paris',
  nomVoie: 'rue de la Paix',
  numeroVoie: '1',
}

// Formulaire unique : tous les champs sont saisis, le SIRET n'est qu'un accélérateur.
const creationSaisie = {
  adresse: adresseDuSiret,
  complementAdresse: '',
  itinerant: false,
  nom: 'Mon lieu',
  repliSirene: null,
  siret: null,
  typologies: ['ASSO'],
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
