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

  it('avec un SIRET, quand l’adresse reprise du SIRET est trouvée dans la BAN, alors le lieu est mis à jour tel que saisi', async () => {
    // WHEN
    const result = await modifierLieuInclusion().handle({
      modification: {
        ...modificationSaisie,
        complementAdresse: 'Bâtiment B',
        itinerant: true,
        repliSirene,
        siret: '12345678901234',
        typologies: ['BIB'],
      },
      structureId: '42',
    })

    // THEN
    expect(result).toBe('OK')
    // Le code INSEE du SIRET aide le géocodage tant que l'adresse n'a pas été retouchée.
    expect(spiedGeocodageParams).toStrictEqual({ adresse: adresseDuSiret, codeInsee: '75101' })
    expect(spiedUpdateData?.adresseEnrichie).toStrictEqual(adresseGeocodee)
    expect(spiedUpdateData?.adresseSirene).toBeNull()
    expect(spiedUpdateData?.complementAdresse).toBe('Bâtiment B')
    expect(spiedUpdateData?.date).toStrictEqual(epochTime)
    expect(spiedUpdateData?.itinerance).toStrictEqual(['Itinérant'])
    expect(spiedUpdateData?.nom).toBe('Mon Lieu')
    expect(spiedUpdateData?.siret).toBe('12345678901234')
    expect(spiedUpdateData?.structureUid.state.value).toBe(42)
    expect(spiedUpdateData?.typologies).toStrictEqual(['BIB'])
  })

  it('avec un SIRET, quand l’adresse reprise du SIRET est introuvable dans la BAN, alors le lieu est mis à jour avec les composants SIRENE', async () => {
    // GIVEN
    geocodeResultat = null

    // WHEN
    const result = await modifierLieuInclusion().handle({
      modification: { ...modificationSaisie, repliSirene, siret: '12345678901234' },
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

  it('avec un SIRET, quand le numéro de voie SIRENE est vide, alors il est enregistré comme nul', async () => {
    // GIVEN
    geocodeResultat = null

    // WHEN
    await modifierLieuInclusion().handle({
      modification: {
        ...modificationSaisie,
        repliSirene: { ...repliSirene, numeroVoie: '' },
        siret: '12345678901234',
      },
      structureId: '42',
    })

    // THEN
    expect(spiedUpdateData?.adresseSirene?.numeroVoie).toBeNull()
  })

  it('avec un SIRET dont l’adresse a été retouchée, ne se replie pas sur les composants SIRENE : ils ne décrivent plus le lieu', async () => {
    // GIVEN
    geocodeResultat = null

    // WHEN
    const result = await modifierLieuInclusion().handle({
      modification: {
        ...modificationSaisie,
        adresse: '2 avenue de l’Opéra 75001 Paris',
        repliSirene,
        siret: '12345678901234',
      },
      structureId: '42',
    })

    // THEN
    expect(spiedGeocodageParams).toStrictEqual({ adresse: '2 avenue de l’Opéra 75001 Paris' })
    expect(result).toBe('adresseIntrouvable')
    expect(spiedUpdateData).toBeNull()
  })

  it('sans SIRET, quand l’adresse saisie est trouvée dans la BAN, alors le lieu est mis à jour avec la saisie manuelle', async () => {
    // WHEN
    const result = await modifierLieuInclusion().handle({
      modification: {
        ...modificationSaisie,
        complementAdresse: 'Bâtiment B',
        itinerant: true,
        typologies: ['ASSO', 'CCAS'],
      },
      structureId: '42',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedGeocodageParams).toStrictEqual({ adresse: adresseDuSiret })
    expect(spiedUpdateData?.adresseEnrichie).toStrictEqual(adresseGeocodee)
    expect(spiedUpdateData?.adresseSirene).toBeNull()
    expect(spiedUpdateData?.complementAdresse).toBe('Bâtiment B')
    expect(spiedUpdateData?.itinerance).toStrictEqual(['Itinérant'])
    expect(spiedUpdateData?.nom).toBe('Mon Lieu')
    expect(spiedUpdateData?.siret).toBeNull()
    expect(spiedUpdateData?.typologies).toStrictEqual(['ASSO', 'CCAS'])
  })

  it('sans SIRET, quand le lieu n’est pas itinérant et le complément vide, alors l’itinérance est fixe et le complément nul', async () => {
    // WHEN
    await modifierLieuInclusion().handle({ modification: modificationSaisie, structureId: '42' })

    // THEN
    expect(spiedUpdateData?.complementAdresse).toBeNull()
    expect(spiedUpdateData?.itinerance).toStrictEqual(['Fixe'])
  })

  it('sans SIRET, quand l’adresse saisie est introuvable dans la BAN, alors la modification est refusée', async () => {
    // GIVEN
    geocodeResultat = null

    // WHEN
    const result = await modifierLieuInclusion().handle({
      modification: { ...modificationSaisie, adresse: 'adresse inconnue' },
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
const modificationSaisie = {
  adresse: adresseDuSiret,
  complementAdresse: '',
  itinerant: false,
  nom: 'Mon Lieu',
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

const lieuInclusionRepository: UpdateLieuInclusionInformationsGeneralesRepository = {
  async updateInformationsGenerales(data: UpdateLieuInclusionInformationsGeneralesData): Promise<void> {
    spiedUpdateData = data
    return Promise.resolve()
  },
}

function modifierLieuInclusion(): ModifierLieuInclusionInformationsGenerales {
  return new ModifierLieuInclusionInformationsGenerales(banGeocodingGateway, lieuInclusionRepository, epochTime)
}
