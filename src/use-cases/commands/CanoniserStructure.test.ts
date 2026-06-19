import { beforeEach, describe, expect, it } from 'vitest'

import {
  Canonisation,
  CanoniserFailure,
  CanoniserStructure,
  CanoniserStructureRepository,
  StructureACanoniser,
} from './CanoniserStructure'
import { ResultAsync } from '../CommandHandler'
import { AdresseGeocodeReadModel, BanGeocodingGateway } from '@/gateways/apiBan/BanGeocodingGateway'
import { epochTime } from '@/shared/testHelper'
import { EntrepriseNonTrouvee, EntrepriseReadModel, SireneLoader } from '@/use-cases/queries/RechercherUneEntreprise'

describe('canoniser une structure', () => {
  beforeEach(() => {
    spiedCanonisation = null
    spiedSiret = null
  })

  it('refuse une structure introuvable, sans interroger l’INSEE', async () => {
    // GIVEN
    const canoniser = creerCanoniser({ structure: null })

    // WHEN
    const result = await canoniser.handle({ structureId: 1, uidUtilisateur: 'admin-1' })

    // THEN
    expect(result).toBe('structureIntrouvable')
    expect(spiedSiret).toBeNull()
    expect(spiedCanonisation).toBeNull()
  })

  it('refuse une structure déjà supprimée', async () => {
    // GIVEN
    const canoniser = creerCanoniser({ structure: structure({ deletedAt: epochTime }) })

    // WHEN
    const result = await canoniser.handle({ structureId: 1, uidUtilisateur: 'admin-1' })

    // THEN
    expect(result).toBe('structureIntrouvable')
  })

  it('refuse une structure déjà canonique', async () => {
    // GIVEN
    const canoniser = creerCanoniser({ structure: structure({ denominationAntenne: null }) })

    // WHEN
    const result = await canoniser.handle({ structureId: 1, uidUtilisateur: 'admin-1' })

    // THEN
    expect(result).toBe('structureDejaCanonique')
  })

  it('refuse une antenne sans SIRET', async () => {
    // GIVEN
    const canoniser = creerCanoniser({ structure: structure({ siret: null }) })

    // WHEN
    const result = await canoniser.handle({ structureId: 1, uidUtilisateur: 'admin-1' })

    // THEN
    expect(result).toBe('siretManquant')
    expect(spiedSiret).toBeNull()
  })

  it('refuse de canoniser si une canonique de même SIRET existe déjà', async () => {
    // GIVEN
    const canoniser = creerCanoniser({ existeCanonique: true, structure: structure({}) })

    // WHEN
    const result = await canoniser.handle({ structureId: 1, uidUtilisateur: 'admin-1' })

    // THEN
    expect(result).toBe('canoniqueExistante')
    expect(spiedSiret).toStrictEqual({ exceptId: 1, siret: '13002603200016' })
    expect(spiedCanonisation).toBeNull()
  })

  it('refuse quand l’INSEE ne trouve aucun établissement actif', async () => {
    // GIVEN
    const canoniser = creerCanoniser({ entreprise: { estTrouvee: false }, structure: structure({}) })

    // WHEN
    const result = await canoniser.handle({ structureId: 1, uidUtilisateur: 'admin-1' })

    // THEN
    expect(result).toBe('entrepriseIntrouvable')
    expect(spiedCanonisation).toBeNull()
  })

  it('canonise en alignant sur l’image INSEE et l’adresse géocodée', async () => {
    // GIVEN
    const canoniser = creerCanoniser({ structure: structure({}) })

    // WHEN
    const result = await canoniser.handle({ structureId: 1, uidUtilisateur: 'admin-1' })

    // THEN
    expect(result).toBe('OK')
    expect(spiedSiret).toStrictEqual({ exceptId: 1, siret: '13002603200016' })
    expect(spiedCanonisation).toStrictEqual({
      entreprise: entrepriseInsee,
      geocode: geocodeInsee,
      parUtilisateur: 'admin-1',
      structureId: 1,
    })
  })

  it('canonise quand même si le géocodage BAN ne renvoie rien (adresse best-effort)', async () => {
    // GIVEN
    const canoniser = creerCanoniser({ geocode: null, structure: structure({}) })

    // WHEN
    const result = await canoniser.handle({ structureId: 1, uidUtilisateur: 'admin-1' })

    // THEN
    expect(result).toBe('OK')
    expect(spiedCanonisation?.geocode).toBeNull()
  })
})

let spiedCanonisation: Canonisation | null
let spiedSiret: null | Readonly<{ exceptId: number; siret: string }>

const entrepriseInsee: EntrepriseReadModel = {
  activitePrincipale: '84.12Z',
  adresse: '20 AVENUE DE SEGUR, 75007 PARIS',
  categorieJuridiqueCode: '7389',
  codeInsee: '75107',
  codePostal: '75007',
  commune: 'PARIS',
  denomination: 'AGENCE NATIONALE DE LA COHESION DES TERRITOIRES',
  identifiant: '13002603200016',
  nomVoie: 'AVENUE DE SEGUR',
  numeroVoie: '20',
}

const geocodeInsee: AdresseGeocodeReadModel = {
  banClefInterop: '75107_8909_00020',
  banCodeBan: null,
  banCodeInsee: '75107',
  banCodePostal: '75007',
  banLatitude: 48.85,
  banLongitude: 2.31,
  banNomCommune: 'Paris',
  banNomVoie: 'Avenue de Ségur',
  banNumeroVoie: 20,
  banRepetition: null,
  score: 0.98,
  type: 'housenumber',
}

function structure(overrides: Partial<StructureACanoniser>): StructureACanoniser {
  return { deletedAt: null, denominationAntenne: 'Antenne Paris', siret: '13002603200016', ...overrides }
}

function creerCanoniser(
  options: Readonly<{
    entreprise?: EntrepriseNonTrouvee | EntrepriseReadModel
    existeCanonique?: boolean
    geocode?: AdresseGeocodeReadModel | null
    structure: null | StructureACanoniser
  }>
): CanoniserStructure {
  const sireneLoader: SireneLoader = {
    async rechercherParIdentifiant(): Promise<EntrepriseNonTrouvee | EntrepriseReadModel> {
      return Promise.resolve(options.entreprise ?? entrepriseInsee)
    },
  }
  const banGeocodingGateway: BanGeocodingGateway = {
    async geocoder(): Promise<AdresseGeocodeReadModel | null> {
      return Promise.resolve(options.geocode === undefined ? geocodeInsee : options.geocode)
    },
  }

  return new CanoniserStructure(sireneLoader, banGeocodingGateway, new RepositorySpy(options))
}

class RepositorySpy implements CanoniserStructureRepository {
  readonly #options: Readonly<{ existeCanonique?: boolean; structure: null | StructureACanoniser }>

  constructor(options: Readonly<{ existeCanonique?: boolean; structure: null | StructureACanoniser }>) {
    this.#options = options
  }

  canoniser(canonisation: Canonisation): ResultAsync<CanoniserFailure> {
    spiedCanonisation = canonisation
    return Promise.resolve('OK')
  }

  existeCanoniquePourSiret(siret: string, exceptId: number): Promise<boolean> {
    spiedSiret = { exceptId, siret }
    return Promise.resolve(this.#options.existeCanonique ?? false)
  }

  lireStructure(): Promise<null | StructureACanoniser> {
    return Promise.resolve(this.#options.structure)
  }
}
