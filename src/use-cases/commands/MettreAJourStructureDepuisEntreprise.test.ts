import { describe, expect, it } from 'vitest'

import { MettreAJourStructureDepuisEntreprise } from './MettreAJourStructureDepuisEntreprise'
import {
  AdresseARattacher,
  DonneesLegalesEntreprise,
  MettreAJourStructureDepuisEntrepriseRepository,
} from './shared/StructureRepository'
import { AdresseGeocodeReadModel, BanGeocodingGateway, GeocodageParams } from '@/gateways/apiBan/BanGeocodingGateway'

describe('mettre à jour une structure depuis les données officielles de l’API Entreprise', () => {
  it('géocode l’adresse officielle puis met à jour les champs légaux et l’adresse', async () => {
    // GIVEN
    const geocoder = geocodage(adresseGeocodee())
    const repository = repositoryStub(true)

    // WHEN
    const result = await new MettreAJourStructureDepuisEntreprise({ geocoder }, repository).handle({
      adresse: '172 B RTE DE LYON, 42300 ROANNE',
      categorieJuridique: '9220',
      codeActivitePrincipale: '88.99B',
      denominationSirene: 'Emmaus Connect',
      siret: '79227291600034',
      structureId: 978,
    })

    // THEN
    expect(result).toBe('OK')
    expect(geocoder).toHaveBeenCalledWith({ adresse: '172 B RTE DE LYON, 42300 ROANNE' })
    expect(repository.mettreAJourDepuisEntreprise).toHaveBeenCalledWith(
      978,
      {
        categorieJuridique: '9220',
        codeActivitePrincipale: '88.99B',
        denominationSirene: 'Emmaus Connect',
        siret: '79227291600034',
      },
      {
        clefInterop: '42187_bbbb',
        codeBan: null,
        codeInsee: '42187',
        codePostal: '42300',
        latitude: 46.03,
        longitude: 4.06,
        nomCommune: 'Roanne',
        nomVoie: 'Route de Lyon',
        numeroVoie: 172,
        repetition: 'B',
      }
    )
  })

  it('renvoie une erreur quand la structure est introuvable', async () => {
    // GIVEN
    const geocoder = geocodage(adresseGeocodee())
    const repository = repositoryStub(false)

    // WHEN
    const result = await new MettreAJourStructureDepuisEntreprise({ geocoder }, repository).handle(commande())

    // THEN
    expect(result).toBe('structureIntrouvable')
    expect(geocoder).not.toHaveBeenCalled()
    expect(repository.mettreAJourDepuisEntreprise).not.toHaveBeenCalled()
  })

  it('renvoie une erreur quand l’adresse officielle n’est pas géocodable', async () => {
    // GIVEN
    const geocoder = geocodage(null)
    const repository = repositoryStub(true)

    // WHEN
    const result = await new MettreAJourStructureDepuisEntreprise({ geocoder }, repository).handle(commande())

    // THEN
    expect(result).toBe('adresseIntrouvable')
    expect(repository.mettreAJourDepuisEntreprise).not.toHaveBeenCalled()
  })
})

function commande(): Parameters<MettreAJourStructureDepuisEntreprise['handle']>[0] {
  return {
    adresse: '172 B RTE DE LYON, 42300 ROANNE',
    categorieJuridique: '9220',
    codeActivitePrincipale: '88.99B',
    denominationSirene: 'Emmaus Connect',
    siret: '79227291600034',
    structureId: 978,
  }
}

function geocodage(resultat: AdresseGeocodeReadModel | null): BanGeocodingGateway['geocoder'] {
  return vi.fn<(params: GeocodageParams) => Promise<AdresseGeocodeReadModel | null>>().mockResolvedValue(resultat)
}

function repositoryStub(structureExiste: boolean): MettreAJourStructureDepuisEntrepriseRepository {
  return {
    mettreAJourDepuisEntreprise: vi
      .fn<
        (structureId: number, donneesLegales: DonneesLegalesEntreprise, adresse: AdresseARattacher) => Promise<void>
      >()
      .mockResolvedValue(undefined),
    structureExiste: vi.fn<(structureId: number) => Promise<boolean>>().mockResolvedValue(structureExiste),
  }
}

function adresseGeocodee(): AdresseGeocodeReadModel {
  return {
    banClefInterop: '42187_bbbb',
    banCodeBan: null,
    banCodeInsee: '42187',
    banCodePostal: '42300',
    banLatitude: 46.03,
    banLongitude: 4.06,
    banNomCommune: 'Roanne',
    banNomVoie: 'Route de Lyon',
    banNumeroVoie: 172,
    banRepetition: 'B',
    score: 0.95,
    type: 'housenumber',
  }
}
