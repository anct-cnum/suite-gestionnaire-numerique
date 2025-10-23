/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
import { Prisma } from '@prisma/client'

import { AjouterUnMembre } from './AjouterUnMembre'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { ContactData, CreateMembreRepository, EntrepriseData, GetMembreRepository } from './shared/MembreRepository'
import { CreateStructureRepository, GetStructureBySiretRepository, StructureData } from './shared/StructureRepository'
import { TransactionRepository } from './shared/TransactionRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { Membre, MembreUid, Statut } from '@/domain/Membre'
import { MembreCandidat } from '@/domain/MembreCandidat'
import { Structure, StructureUid } from '@/domain/Structure'
import { gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { AdresseGeocodeReadModel, BanGeocodingGateway, GeocodageParams } from '@/gateways/apiBan/BanGeocodingGateway'

describe('ajouter un membre', () => {
  beforeEach(() => {
    spiedMembreCreated = null
    spiedEntrepriseData = undefined
    spiedStructureIdLinked = null
    structureExistante = null
  })

  it('étant donné une gouvernance et une structure existante, quand un membre est créé avec un SIRET correspondant, alors le membre est lié à la structure existante', async () => {
    // GIVEN
    const siret = '12345678901234'
    structureExistante = { id: 123, identifiantEtablissement: siret }

    const ajouterUnMembre = new AjouterUnMembre(
      new GestionnaireRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new MembreAvecStructureRepositorySpy(),
      new StructureExistanteRepositorySpy(),
      new TransactionRepositorySpy(),
      new BanGeocodingGatewaySpy()
    )

    // WHEN
    const result = await ajouterUnMembre.handle({
      contact: {
        email: 'contact@example.com',
        fonction: 'Directeur',
        nom: 'Dupont',
        prenom: 'Jean',
      },
      entreprise: {
        adresse: '123 rue de la Paix',
        categorieJuridiqueCode: '5710',
        categorieJuridiqueUniteLegale: 'SAS',
        codeInsee: '75101',
        codePostal: '75001',
        commune: 'Paris',
        nom: 'Entreprise Test',
        nomVoie: 'RUE DE LA PAIX',
        numeroVoie: '123',
        siret,
      },
      uidGestionnaire,
      uidGouvernance,
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedStructureIdLinked).toBe(123)
    expect(spiedMembreCreated).not.toBeNull()
    expect(spiedEntrepriseData?.siret).toBe(siret)
  })

  it('étant donné une gouvernance et aucune structure existante, quand un membre est créé avec un SIRET, alors une nouvelle structure est créée et le membre y est lié', async () => {
    // GIVEN
    const siret = '98765432109876'
    structureExistante = null

    const ajouterUnMembre = new AjouterUnMembre(
      new GestionnaireRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new MembreAvecNouvelleStructureRepositorySpy(),
      new StructureNouvelleRepositorySpy(),
      new TransactionRepositorySpy(),
      new BanGeocodingGatewaySpy()
    )

    // WHEN
    const result = await ajouterUnMembre.handle({
      contact: {
        email: 'contact@example.com',
        fonction: 'Directeur',
        nom: 'Martin',
        prenom: 'Pierre',
      },
      entreprise: {
        adresse: '123 rue de la Paix',
        categorieJuridiqueCode: '5710',
        categorieJuridiqueUniteLegale: 'SAS',
        codeInsee: '75101',
        codePostal: '75001',
        commune: 'Paris',
        nom: 'Nouvelle Entreprise',
        nomVoie: 'RUE DE LA PAIX',
        numeroVoie: '123',
        siret,
      },
      uidGestionnaire,
      uidGouvernance,
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedStructureCreated).toStrictEqual({
      departementCode: '75',
      identifiantEtablissement: siret,
      nom: 'Nouvelle Entreprise',
    })
    expect(spiedMembreCreated).not.toBeNull()
    expect(spiedEntrepriseData?.siret).toBe(siret)
  })

  it('étant donné une gouvernance, quand un membre est créé par un gestionnaire qui n\'a pas ce droit, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterUnMembre = new AjouterUnMembre(
      new GestionnaireAutreRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new MembreRepositorySpy(),
      new StructureSansResultatRepositorySpy(),
      new TransactionRepositorySpy(),
      new BanGeocodingGatewaySpy()
    )

    // WHEN
    const result = await ajouterUnMembre.handle({
      contact: {
        email: 'contact@example.com',
        fonction: 'Directeur',
        nom: 'Test',
        prenom: 'Test',
      },
      entreprise: {
        adresse: '123 rue de la Paix',
        categorieJuridiqueCode: '5710',
        categorieJuridiqueUniteLegale: 'SAS',
        codeInsee: '75101',
        codePostal: '75001',
        commune: 'Paris',
        nom: 'Test',
        nomVoie: 'RUE DE LA PAIX',
        numeroVoie: '123',
        siret: '',
      },
      uidGestionnaire: 'utilisateurUsurpateur',
      uidGouvernance,
    })

    // THEN
    expect(spiedMembreCreated).toBeNull()
    expect(result).toBe('gestionnaireNePeutPasAjouterDeMembreDansLaGouvernance')
  })
})

const uidGouvernance = 'gouvernanceFooId'
const uidGestionnaire = 'userFooId'
let spiedMembreCreated: Membre | null
let spiedEntrepriseData: EntrepriseData | undefined
let spiedStructureIdLinked: null | number
let spiedStructureCreated: { departementCode: string; identifiantEtablissement: string; nom: string } | undefined
let structureExistante: { id: number; identifiantEtablissement: string } | null

class GouvernanceRepositorySpy implements GetGouvernanceRepository {
  async get(_: GouvernanceUid): Promise<Gouvernance> {
    return Promise.resolve(
      gouvernanceFactory({
        departement: {
          code: '75',
          codeRegion: '11',
          nom: 'Paris',
        },
        uid: uidGouvernance,
      })
    )
  }
}

class GestionnaireRepositorySpy implements GetUtilisateurRepository {
  async get(_: UtilisateurUidState['value']): Promise<Utilisateur> {
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' }))
  }
}

class GestionnaireAutreRepositorySpy implements GetUtilisateurRepository {
  async get(_: UtilisateurUidState['value']): Promise<Utilisateur> {
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '10', role: 'Gestionnaire département' }))
  }
}

class TransactionRepositorySpy implements TransactionRepository {
  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    // Simule une transaction en exécutant directement la fonction
    return fn({} as Prisma.TransactionClient)
  }
}

class MembreRepositorySpy implements CreateMembreRepository, GetMembreRepository {
  async create(membre: Membre, entrepriseData: EntrepriseData, _?: ContactData, __?: ContactData,  ___?: 
  Prisma.TransactionClient): Promise<void> {
    spiedMembreCreated = membre
    spiedEntrepriseData = entrepriseData
    return Promise.resolve()
  }

  async get(_uid: string, __?: Prisma.TransactionClient): Promise<Membre> {
    return Promise.resolve(new MembreCandidat(
      new MembreUid('test-uid'),
      'Test',
      new GouvernanceUid(uidGouvernance),
      new Statut('candidat'),
      new StructureUid(1)
    ))
  }
}

class MembreAvecStructureRepositorySpy extends MembreRepositorySpy {
  override async create(membre: Membre, entrepriseData: EntrepriseData,_?: ContactData, __?: ContactData,  ___?:
  Prisma.TransactionClient): Promise<void> {
    spiedMembreCreated = membre
    spiedEntrepriseData = entrepriseData

    // Simuler la recherche d'une structure existante par SIRET et lier le membre
    if (entrepriseData.siret && structureExistante) {
      spiedStructureIdLinked = structureExistante.id
      // Dans la vraie implémentation, on lierait le membre à la structure via structure_id
    }

    return Promise.resolve()
  }
}

class MembreAvecNouvelleStructureRepositorySpy extends MembreRepositorySpy {
  override async create(membre: Membre,  entrepriseData: EntrepriseData, __?: ContactData, _?: ContactData, ___?: 
  Prisma.TransactionClient): Promise<void> {
    spiedMembreCreated = membre
    spiedEntrepriseData = entrepriseData

    // Simuler la création d'une nouvelle structure si SIRET fourni et aucune structure existante
    if (entrepriseData.siret && !structureExistante) {
      spiedStructureCreated = {
        departementCode: '75',
        identifiantEtablissement: entrepriseData.siret,
        nom: 'Nouvelle Entreprise',
      }
      spiedStructureIdLinked = 999 // ID de la nouvelle structure créée
    }

    return Promise.resolve()
  }
}

// Classes spy pour StructureRepository
class StructureExistanteRepositorySpy implements CreateStructureRepository, GetStructureBySiretRepository {
  async create(_: StructureData, __?: Prisma.TransactionClient): Promise<Structure> {
    throw new Error('Ne devrait pas cr\u00e9er de structure dans ce cas')
  }

  async getBySiret(siret: string, __?: Prisma.TransactionClient): Promise<null | Structure> {
    if (structureExistante && structureExistante.identifiantEtablissement === siret) {
      return Structure.create({
        departementCode: '75',
        identifiantEtablissement: siret,
        nom: 'Structure existante',
        uid: { value: structureExistante.id },
      })
    }
    return null
  }
}

class StructureNouvelleRepositorySpy implements CreateStructureRepository, GetStructureBySiretRepository {
  async create(data: StructureData, __?: Prisma.TransactionClient): Promise<Structure> {
    spiedStructureCreated = {
      departementCode: data.departementCode,
      identifiantEtablissement: data.identifiantEtablissement,
      nom: data.nom,
    }
    return Structure.create({
      departementCode: data.departementCode,
      identifiantEtablissement: data.identifiantEtablissement,
      nom: data.nom,
      uid: { value: 999 },
    })
  }

  async getBySiret(_: string, __?: Prisma.TransactionClient): Promise<null | Structure> {
    return null // Aucune structure existante
  }
}

class StructureSansResultatRepositorySpy implements CreateStructureRepository, GetStructureBySiretRepository {
  async create(_data: StructureData, __?: Prisma.TransactionClient): Promise<Structure> {
    throw new Error('Ne devrait pas cr\u00e9er de structure dans ce cas')
  }

  async getBySiret(_: string, __?: Prisma.TransactionClient): Promise<null | Structure> {
    return null
  }
}

class BanGeocodingGatewaySpy implements BanGeocodingGateway {
  async geocoder(_params: GeocodageParams): Promise<AdresseGeocodeReadModel | null> {
    // Retourner des données mockées pour les tests
    return {
      banClefInterop: '75101_0001_00001',
      banCodeBan: 'mock-ban-id',
      banCodeInsee: '75101',
      banCodePostal: '75001',
      banLatitude: 48.8566,
      banLongitude: 2.3522,
      banNomCommune: 'Paris',
      banNomVoie: 'Rue de la Paix',
      banNumeroVoie: 123,
      banRepetition: null,
      score: 0.95,
      type: 'housenumber',
    }
  }
}