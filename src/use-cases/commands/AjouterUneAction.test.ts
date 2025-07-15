/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prisma } from '@prisma/client'
import { beforeEach, describe, expect, it } from 'vitest'

import { AjouterUneAction } from './AjouterUneAction'
import { AddActionRepository } from './shared/ActionRepository'
import { AddCoFinancementRepository } from './shared/CoFinancementRepository'
import { AddDemandeDeSubventionRepository } from './shared/DemandeDeSubventionRepository'
import {
  GetFeuilleDeRouteRepository,
  UpdateFeuilleDeRouteRepository,
} from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { TransactionRepository } from './shared/TransactionRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Action } from '@/domain/Action'
import { CoFinancement } from '@/domain/CoFinancement'
import { DemandeDeSubvention, StatutSubvention } from '@/domain/DemandeDeSubvention'
import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import {
  actionFactory,
  coFinancementFactory,
  demandeDeSubventionFactory,
  feuilleDeRouteFactory,
  gouvernanceFactory,
  utilisateurFactory,
} from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime, invalidDate } from '@/shared/testHelper'

describe('ajouter une action à une feuille de route', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedGouvernanceToUpdate = null
    spiedUtilisateurUidToFind = null
    spiedFeuilleDeRouteUidToFind = null
    spiedActionToAdd = null
    spiedDemandeDeSubventionToAdd = null
    spiedCoFinancementToAdd = null
  })

  it('étant donné une gouvernance, quand une action est créée par son gestionnaire, alors elle est ajoutée à cette feuille de route avec demandes de subvention et coFinancements', async () => {
    // GIVEN

    const ajouterAction = new AjouterUneAction(
      new GouvernanceRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ActionRepositorySpy(),
      new DemandeDeSubventionRepositorySpy(),
      new CoFinancementRepositorySpy(),
      new TransactionRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterAction.handle({
      besoins: ['besoin 1', 'besoin 2'],
      budgetGlobal: 10000,
      coFinancements: [
        {
          membreId: 'membreFooId',
          montant: 2000,
        },
      ],
      contexte: 'Un contexte de test',
      dateDeDebut: '2024',
      dateDeFin: '2025',
      demandesDeSubvention: [
        {
          beneficiaires: ['uidBeneficiaire1', 'uidBeneficiaire2'],
          enveloppeFinancementId: uidEnveloppeFinancement,
          statut: StatutSubvention.EN_COURS,
          subventionDemandee: 5000,
          subventionEtp: 2000,
          subventionPrestation: 3000,
        },
      ],
      description: 'Description de test',
      destinataires: ['uidBeneficiaire1', 'uidBeneficiaire2'],
      nom,
      uidEditeur,
      uidFeuilleDeRoute,
      uidGouvernance,
      uidPorteurs: [uidPorteur],
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedFeuilleDeRouteUidToFind).toBe(uidFeuilleDeRoute)
    expect(spiedActionToAdd?.state).toStrictEqual(
      actionFactory({
        besoins: ['besoin 1', 'besoin 2'],
        budgetGlobal: 10_000,
        contexte: 'Un contexte de test',
        dateDeCreation: epochTime,
        dateDeDebut: '2024',
        dateDeFin: '2025',
        description: 'Description de test',
        destinataires: ['uidBeneficiaire1', 'uidBeneficiaire2'],
        nom,
        uid: {
          value: 'identifiantPourLaCreation',
        },
        uidFeuilleDeRoute: {
          value: uidFeuilleDeRoute,
        },
        uidPorteurs: ['porteurFooId'],
      }).state
    )

    expect(spiedDemandeDeSubventionToAdd).not.toBeNull()
    expect(spiedDemandeDeSubventionToAdd?.state).toStrictEqual(
      demandeDeSubventionFactory({
        beneficiaires: ['uidBeneficiaire1', 'uidBeneficiaire2'],
        statut: StatutSubvention.EN_COURS,
        subventionDemandee: 5000,
        subventionEtp: 2000,
        subventionPrestation: 3000,
        uid: { value: 'identifiantDemandeDeSubventionPourLaCreation' },
        uidAction: { value: '1' },
        uidEnveloppeFinancement: { value: uidEnveloppeFinancement },
      }).state
    )

    expect(spiedCoFinancementToAdd).not.toBeNull()
    expect(spiedCoFinancementToAdd?.state).toStrictEqual(
      coFinancementFactory({
        montant: 2000,
        uid: { value: 'identifiantCoFinancementPourLaCreation' },
        uidAction: { value: '1' },
        uidMembre: 'membreFooId',
      }).state
    )

    expect(result).toBe('OK')
  })

  it.each([
    {
      date: invalidDate,
      dateDeDebut: '2024',
      dateDeFin: '2025',
      expectedFailure: 'dateDeCreationInvalide',
      intention: 'd‘une date de modification invalide',
    },
    {
      date: epochTime,
      dateDeDebut: 'BLABLA',
      dateDeFin: '2025',
      expectedFailure: 'dateDeDebutInvalide',
      intention: 'd‘une date de début invalide',
    },
    {
      date: epochTime,
      dateDeDebut: '2024',
      dateDeFin: 'BLABLA',
      expectedFailure: 'dateDeFinInvalide',
      intention: 'd‘une date de fin invalide',
    },
  ])(
    'étant donné une feuille de route, quand une action est créée par son gestionnaire n‘est pas valide à cause $intention, alors une erreur est renvoyée',
    async ({ date, dateDeDebut, dateDeFin, expectedFailure }) => {
      // GIVEN
      const ajouterAction = new AjouterUneAction(
        new GouvernanceRepositorySpy(),
        new FeuilleDeRouteRepositorySpy(),
        new GestionnaireRepositorySpy(),
        new ActionRepositorySpy(),
        new DemandeDeSubventionRepositorySpy(),
        new CoFinancementRepositorySpy(),
        new TransactionRepositorySpy(),
        date
      )

      const command = {
        besoins: ['besoin 1'],
        budgetGlobal: 10000,
        contexte: 'Un contexte',
        dateDeDebut,
        dateDeFin,
        description: 'Description',
        destinataires: ['uidBeneficiaire1', 'uidBeneficiaire2'],
        nom,
        uidEditeur,
        uidFeuilleDeRoute,
        uidGouvernance,
        uidPorteurs: [uidPorteur],
      }

      // WHEN
      const result = await ajouterAction.handle(command)

      // THEN
      expect(spiedActionToAdd).toBeNull()
      expect(result).toBe(expectedFailure)
    }
  )

  it('étant donné une feuille de route, quand une action est créée par un gestionnaire qui n‘a pas ce droit, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterAction = new AjouterUneAction(
      new GouvernanceRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      new GestionnaireAutreRepositorySpy(),
      new ActionRepositorySpy(),
      new DemandeDeSubventionRepositorySpy(),
      new CoFinancementRepositorySpy(),
      new TransactionRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterAction.handle({
      besoins: ['besoin 1'],
      budgetGlobal: 10000,
      contexte: 'Un contexte',
      dateDeDebut: new Date(epochTime).toISOString(),
      dateDeFin: new Date(epochTime).toISOString(),
      description: 'Description valide',
      destinataires: ['uidBeneficiaire1', 'uidBeneficiaire2'],
      nom,
      uidEditeur,
      uidFeuilleDeRoute,
      uidGouvernance,
      uidPorteurs: [uidPorteur],
    })

    // THEN
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('utilisateurNePeutPasAjouterAction')
  })
})

const uidGouvernance = 'gouvernanceFooId'
const nom = 'Feuille de route 69'
const uidPorteur = 'porteurFooId'
const uidEditeur = 'editeurFooId'
const uidFeuilleDeRoute = 'feuilleDeRouteFooId'
const uidEnveloppeFinancement = 'enveloppeFinancementFooId'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedGouvernanceToUpdate: Gouvernance | null
let spiedUtilisateurUidToFind: null | string
let spiedFeuilleDeRouteUidToFind: null | string
let spiedActionToAdd: Action | null
let spiedDemandeDeSubventionToAdd: DemandeDeSubvention | null
let spiedCoFinancementToAdd: CoFinancement | null

class GouvernanceRepositorySpy implements GetGouvernanceRepository {
  async get(uid: GouvernanceUid): Promise<Gouvernance> {
    spiedGouvernanceUidToFind = uid
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

class FeuilleDeRouteRepositorySpy
implements GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository
{
  async get(uid: string): Promise<FeuilleDeRoute> {
    spiedFeuilleDeRouteUidToFind = uid
    return Promise.resolve(
      feuilleDeRouteFactory({
        uid: { value: uidFeuilleDeRoute },
      })
    )
  }

  async update(_feuilleDeRoute: FeuilleDeRoute): Promise<void> {
    return Promise.resolve()
  }
}

class GestionnaireRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(
      utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
    )
  }
}

class GestionnaireAutreRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(
      utilisateurFactory({ codeOrganisation: '10', role: 'Gestionnaire département' })
    )
  }
}

class ActionRepositorySpy implements AddActionRepository {
  async add(action: Action): Promise<number> {
    spiedActionToAdd = action
    return Promise.resolve(1)
  }

  async get(uid: string): Promise<Action> {
    return Promise.resolve(
      actionFactory({
        besoins: [],
        budgetGlobal: 1000,
        contexte: 'contexte de l‘action',
        dateDeCreation: epochTime,
        dateDeDebut: '2024',
        dateDeFin: '2025',
        description: 'description de l‘action',
        destinataires: [],
        nom: 'Structurer une association',
        uid: { value: uid },
        uidFeuilleDeRoute: { value: '123' },
        uidPorteurs: ['porteur123'],
      })
    )
  }
}

class DemandeDeSubventionRepositorySpy implements AddDemandeDeSubventionRepository {
  async add(demandeDeSubvention: DemandeDeSubvention): Promise<boolean> {
    spiedDemandeDeSubventionToAdd = demandeDeSubvention
    return Promise.resolve(true)
  }
}

class CoFinancementRepositorySpy implements AddCoFinancementRepository {
  async add(coFinancement: CoFinancement): Promise<boolean> {
    spiedCoFinancementToAdd = coFinancement
    return Promise.resolve(true)
  }
}

class TransactionRepositorySpy implements TransactionRepository {
  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return fn({} as Prisma.TransactionClient)
  }
}
