import { beforeEach, describe, expect, it } from 'vitest'

import { ModifierUneAction } from './ModifierUneAction'
import { GetActionRepository, UpdateActionRepository } from './shared/ActionRepository'
import {
  AddCoFinancementRepository,
  GetCoFinancementRepository,
  SupprimerCoFinancementRepository,
  UpdateCoFinancementRepository,
} from './shared/CoFinancementRepository'
import {
  AddDemandeDeSubventionRepository,
  GetDemandeDeSubventionRepository,
  SupprimerDemandeDeSubventionRepository,
  UpdateDemandeDeSubventionRepository,
} from './shared/DemandeDeSubventionRepository'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { TransactionRepository } from './shared/TransactionRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Prisma } from '../../../prisma/generated/client'
import { Action } from '@/domain/Action'
import { CoFinancement } from '@/domain/CoFinancement'
import { DemandeDeSubvention } from '@/domain/DemandeDeSubvention'
import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { actionFactory, feuilleDeRouteFactory, gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

describe('modifier une action', () => {
  beforeEach(() => {
    spiedActionToUpdate = null
    spiedFeuilleDeRouteToUpdate = null
  })

  it('quand le gestionnaire de la gouvernance modifie une action de sa feuille de route, alors l’action et la feuille de route sont mises à jour', async () => {
    // WHEN
    const result = await modifierUneAction(
      gestionnaireDeLaGouvernance,
      feuilleDeRouteFactory({ uid: { value: uidFeuilleDeRoute }, uidGouvernance: { value: uidGouvernance } }),
      actionFactory({
        demandeDeSubventionUid: '',
        uid: { value: uidAction },
        uidFeuilleDeRoute: { value: uidFeuilleDeRoute },
      })
    ).handle(command)

    // THEN
    expect(result).toBe('OK')
    expect(spiedActionToUpdate?.state.nom).toBe('Nom modifié')
    expect(spiedActionToUpdate?.state.uidFeuilleDeRoute).toBe(uidFeuilleDeRoute)
    expect(spiedFeuilleDeRouteToUpdate?.state.uid.value).toBe(uidFeuilleDeRoute)
  })

  it.each([
    {
      action: actionFactory({ uid: { value: uidAction }, uidFeuilleDeRoute: { value: uidFeuilleDeRoute } }),
      attendu: 'utilisateurNePeutPasAjouterAction',
      feuilleDeRoute: feuilleDeRouteFactory({
        uid: { value: uidFeuilleDeRoute },
        uidGouvernance: { value: uidGouvernance },
      }),
      intention: 'l’utilisateur n’est pas gestionnaire de la gouvernance',
      utilisateur: utilisateurFactory({ codeOrganisation: '10', role: 'Gestionnaire département' }),
    },
    {
      action: actionFactory({ uid: { value: uidAction }, uidFeuilleDeRoute: { value: uidFeuilleDeRoute } }),
      attendu: 'feuilleDeRouteNonAssocieeALaGouvernance',
      feuilleDeRoute: feuilleDeRouteFactory({
        uid: { value: uidFeuilleDeRoute },
        uidGouvernance: { value: 'autreGouvernanceId' },
      }),
      intention: 'la feuille de route est rattachée à une autre gouvernance',
      utilisateur: gestionnaireDeLaGouvernance,
    },
    {
      action: actionFactory({ uid: { value: uidAction }, uidFeuilleDeRoute: { value: 'autreFeuilleDeRouteId' } }),
      attendu: 'actionNonAssocieeALaFeuilleDeRoute',
      feuilleDeRoute: feuilleDeRouteFactory({
        uid: { value: uidFeuilleDeRoute },
        uidGouvernance: { value: uidGouvernance },
      }),
      intention: 'l’action est rattachée à une autre feuille de route',
      utilisateur: gestionnaireDeLaGouvernance,
    },
  ])(
    'quand $intention, alors une erreur est renvoyée et rien n’est modifié',
    async ({ action, attendu, feuilleDeRoute, utilisateur }) => {
      // WHEN
      const result = await modifierUneAction(utilisateur, feuilleDeRoute, action).handle(command)

      // THEN
      expect(result).toBe(attendu)
      expect(spiedActionToUpdate).toBeNull()
      expect(spiedFeuilleDeRouteToUpdate).toBeNull()
    }
  )
})

const uidGouvernance = 'gouvernanceFooId'
const uidFeuilleDeRoute = 'feuilleDeRouteFooId'
const uidAction = 'actionFooId'
const gestionnaireDeLaGouvernance = utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
const command = {
  anneeDeDebut: '2024',
  anneeDeFin: '2025',
  besoins: ['besoin 1'],
  budgetGlobal: 10_000,
  coFinancements: [],
  contexte: 'Un contexte',
  description: 'Description valide',
  destinataires: ['uidBeneficiaire1'],
  nom: 'Nom modifié',
  uid: uidAction,
  uidEditeur: 1,
  uidFeuilleDeRoute,
  uidGouvernance,
  uidPorteurs: ['porteurFooId'],
}
let spiedActionToUpdate: Action | null
let spiedFeuilleDeRouteToUpdate: FeuilleDeRoute | null

function modifierUneAction(
  utilisateur: Utilisateur,
  feuilleDeRoute: FeuilleDeRoute,
  action: Action
): ModifierUneAction {
  return new ModifierUneAction(
    new GouvernanceRepositorySpy(),
    new FeuilleDeRouteRepositorySpy(feuilleDeRoute),
    new UtilisateurRepositorySpy(utilisateur),
    new ActionRepositorySpy(action),
    new TransactionRepositorySpy(),
    new DemandeDeSubventionRepositorySpy(),
    new CoFinancementRepositorySpy(),
    epochTime
  )
}

class GouvernanceRepositorySpy implements GetGouvernanceRepository {
  async get(uid: GouvernanceUid): Promise<Gouvernance> {
    return Promise.resolve(gouvernanceFactory({ uid: uid.state.value }))
  }
}

class FeuilleDeRouteRepositorySpy implements GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository {
  readonly #feuilleDeRoute: FeuilleDeRoute

  constructor(feuilleDeRoute: FeuilleDeRoute) {
    this.#feuilleDeRoute = feuilleDeRoute
  }

  async get(): Promise<FeuilleDeRoute> {
    return Promise.resolve(this.#feuilleDeRoute)
  }

  async update(feuilleDeRoute: FeuilleDeRoute): Promise<void> {
    spiedFeuilleDeRouteToUpdate = feuilleDeRoute
    return Promise.resolve()
  }
}

class UtilisateurRepositorySpy implements GetUtilisateurRepository {
  readonly #utilisateur: Utilisateur

  constructor(utilisateur: Utilisateur) {
    this.#utilisateur = utilisateur
  }

  async get(): Promise<Utilisateur> {
    return Promise.resolve(this.#utilisateur)
  }
}

class ActionRepositorySpy implements GetActionRepository, UpdateActionRepository {
  readonly #action: Action

  constructor(action: Action) {
    this.#action = action
  }

  async get(): Promise<Action> {
    return Promise.resolve(this.#action)
  }

  async update(action: Action): Promise<boolean> {
    spiedActionToUpdate = action
    return Promise.resolve(true)
  }
}

class TransactionRepositorySpy implements TransactionRepository {
  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return fn({} as Prisma.TransactionClient)
  }
}

class DemandeDeSubventionRepositorySpy
  implements
    AddDemandeDeSubventionRepository,
    GetDemandeDeSubventionRepository,
    SupprimerDemandeDeSubventionRepository,
    UpdateDemandeDeSubventionRepository
{
  async add(): Promise<boolean> {
    return Promise.resolve(true)
  }

  async get(): Promise<DemandeDeSubvention> {
    return Promise.reject(new Error('non attendu'))
  }

  async supprimer(): Promise<boolean> {
    return Promise.resolve(true)
  }

  async update(): Promise<boolean> {
    return Promise.resolve(true)
  }
}

class CoFinancementRepositorySpy
  implements
    AddCoFinancementRepository,
    GetCoFinancementRepository,
    SupprimerCoFinancementRepository,
    UpdateCoFinancementRepository
{
  async add(): Promise<boolean> {
    return Promise.resolve(true)
  }

  async get(): Promise<Array<CoFinancement>> {
    return Promise.resolve([])
  }

  async supprimer(): Promise<boolean> {
    return Promise.resolve(true)
  }

  async update(): Promise<boolean> {
    return Promise.resolve(true)
  }
}
