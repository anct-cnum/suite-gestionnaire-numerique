/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prisma } from '@prisma/client'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  MembreExistantLoader,
  RejoindreUneGouvernance,
  StructureCandidature,
  StructureCandidatureLoader,
} from './RejoindreUneGouvernance'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { ContactData, CreateMembreRepository, EntrepriseData } from './shared/MembreRepository'
import { TransactionRepository } from './shared/TransactionRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { Membre } from '@/domain/Membre'
import { gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('rejoindre une gouvernance', () => {
  beforeEach(() => {
    spiedContact = undefined
    spiedContactTechnique = undefined
    spiedEntrepriseData = undefined
    spiedMembreCreated = null
    spiedStructureIdVerifie = null
  })

  it('étant donné un utilisateur rattaché à une structure non membre, quand il candidate à une gouvernance, alors le membre candidat est créé avec les données de sa structure', async () => {
    // GIVEN
    const rejoindreUneGouvernance = new RejoindreUneGouvernance(
      new UtilisateurAvecStructureRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new MembreRepositorySpy(),
      new MembreInexistantLoaderSpy(),
      new StructureCandidatureLoaderSpy(),
      new TransactionRepositorySpy()
    )

    // WHEN
    const result = await rejoindreUneGouvernance.handle({
      codeDepartement: '75',
      contact: {
        email: 'contact@example.com',
        fonction: 'Directeur',
        nom: 'Dupont',
        prenom: 'Jean',
      },
      contactTechnique: {
        email: 'technique@example.com',
        fonction: 'DSI',
        nom: 'Martin',
        prenom: 'Pierre',
      },
      uidUtilisateur,
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedMembreCreated).not.toBeNull()
    expect(spiedMembreCreated?.state.nom).toBe('Ma Structure')
    expect(spiedMembreCreated?.state.statut).toBe('candidat')
    expect(spiedMembreCreated?.state.uidGouvernance.value).toBe('75')
    expect(spiedEntrepriseData).toStrictEqual({
      categorieJuridiqueCode: '5710',
      categorieJuridiqueUniteLegale: 'SAS, société par actions simplifiée',
      siret: '12345678901234',
    })
    expect(spiedContact).toStrictEqual({
      email: 'contact@example.com',
      fonction: 'Directeur',
      nom: 'Dupont',
      prenom: 'Jean',
    })
    expect(spiedContactTechnique).toStrictEqual({
      email: 'technique@example.com',
      fonction: 'DSI',
      nom: 'Martin',
      prenom: 'Pierre',
    })
  })

  it('étant donné un utilisateur sans structure, quand il candidate à une gouvernance, alors une erreur est renvoyée et aucun membre n’est créé', async () => {
    // GIVEN
    const rejoindreUneGouvernance = new RejoindreUneGouvernance(
      new UtilisateurSansStructureRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new MembreRepositorySpy(),
      new MembreInexistantLoaderSpy(),
      new StructureCandidatureLoaderSpy(),
      new TransactionRepositorySpy()
    )

    // WHEN
    const result = await rejoindreUneGouvernance.handle({
      codeDepartement: '75',
      contact: {
        email: 'contact@example.com',
        fonction: 'Directeur',
        nom: 'Dupont',
        prenom: 'Jean',
      },
      uidUtilisateur,
    })

    // THEN
    expect(result).toBe('utilisateurSansStructure')
    expect(spiedMembreCreated).toBeNull()
  })

  it('étant donné une structure déjà membre de la gouvernance, quand elle candidate à nouveau, alors une erreur est renvoyée et aucun membre n’est créé', async () => {
    // GIVEN
    const rejoindreUneGouvernance = new RejoindreUneGouvernance(
      new UtilisateurAvecStructureRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new MembreRepositorySpy(),
      new MembreExistantLoaderSpy(),
      new StructureCandidatureLoaderSpy(),
      new TransactionRepositorySpy()
    )

    // WHEN
    const result = await rejoindreUneGouvernance.handle({
      codeDepartement: '75',
      contact: {
        email: 'contact@example.com',
        fonction: 'Directeur',
        nom: 'Dupont',
        prenom: 'Jean',
      },
      uidUtilisateur,
    })

    // THEN
    expect(result).toBe('structureDejaMembreDeLaGouvernance')
    expect(spiedStructureIdVerifie).toBe(structureId)
    expect(spiedMembreCreated).toBeNull()
  })
})

const uidUtilisateur = 'userFooId'
const structureId = 123
let spiedMembreCreated: Membre | null
let spiedEntrepriseData: EntrepriseData | undefined
let spiedContact: ContactData | undefined
let spiedContactTechnique: ContactData | undefined
let spiedStructureIdVerifie: null | number

class UtilisateurAvecStructureRepositorySpy implements GetUtilisateurRepository {
  async get(_: UtilisateurUidState['value']): Promise<Utilisateur> {
    return Promise.resolve(utilisateurFactory({ codeOrganisation: `${structureId}`, role: 'Gestionnaire structure' }))
  }
}

class UtilisateurSansStructureRepositorySpy implements GetUtilisateurRepository {
  async get(_: UtilisateurUidState['value']): Promise<Utilisateur> {
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' }))
  }
}

class GouvernanceRepositorySpy implements GetGouvernanceRepository {
  async get(_: GouvernanceUid): Promise<Gouvernance> {
    return Promise.resolve(
      gouvernanceFactory({
        departement: {
          code: '75',
          codeRegion: '11',
          nom: 'Paris',
        },
        uid: '75',
      })
    )
  }
}

class MembreInexistantLoaderSpy implements MembreExistantLoader {
  async existePourStructureDansGouvernance(structureIdAppele: number, _: string): Promise<boolean> {
    spiedStructureIdVerifie = structureIdAppele
    return Promise.resolve(false)
  }
}

class MembreExistantLoaderSpy implements MembreExistantLoader {
  async existePourStructureDansGouvernance(structureIdAppele: number, _: string): Promise<boolean> {
    spiedStructureIdVerifie = structureIdAppele
    return Promise.resolve(true)
  }
}

class StructureCandidatureLoaderSpy implements StructureCandidatureLoader {
  async get(_: number): Promise<StructureCandidature> {
    return Promise.resolve({
      categorieJuridiqueCode: '5710',
      categorieJuridiqueLibelle: 'SAS, société par actions simplifiée',
      nom: 'Ma Structure',
      siret: '12345678901234',
    })
  }
}

class MembreRepositorySpy implements CreateMembreRepository {
  async create(
    membre: Membre,
    entrepriseData: EntrepriseData,
    contact?: ContactData,
    contactTechnique?: ContactData,
    _?: Prisma.TransactionClient
  ): Promise<void> {
    spiedMembreCreated = membre
    spiedEntrepriseData = entrepriseData
    spiedContact = contact
    spiedContactTechnique = contactTechnique
    return Promise.resolve()
  }
}

class TransactionRepositorySpy implements TransactionRepository {
  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return fn({} as Prisma.TransactionClient)
  }
}
