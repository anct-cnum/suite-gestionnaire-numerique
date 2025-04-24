import { AjouterUneAction } from './AjouterUneAction'
import { AddActionRepository } from './shared/ActionRepository'
import { GetFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Action } from '@/domain/Action'
import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { actionFactory, feuilleDeRouteFactory, gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime, invalidDate } from '@/shared/testHelper'

describe('ajouter une action à une gouvernance', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedGouvernanceToUpdate = null
    spiedUtilisateurUidToFind = null
    spiedFeuilleDeRouteUidToFind = null
    spiedActionToAdd = null
  })

  it('étant donné une gouvernance, quand une action est créée par son gestionnaire, alors elle est ajoutée à cette gouvernance', async () => {
    // GIVEN
    const ajouterAction = new AjouterUneAction(
      new GouvernanceRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ActionRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterAction.handle({
      besoins: ['besoin 1', 'besoin 2'],
      budgetGlobal: '10000',
      contexte: 'Un contexte de test',
      dateDeDebut: new Date(epochTime).toISOString(),
      dateDeFin: new Date(epochTime).toISOString(),
      description: 'Description de test',
      nom,
      uidEditeur,
      uidFeuilleDeRoute,
      uidGouvernance,
      uidPorteur,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedFeuilleDeRouteUidToFind).toBe(uidFeuilleDeRoute)
    expect(spiedActionToAdd?.state).toStrictEqual(
      actionFactory(
        {
          besoins: ['besoin 1', 'besoin 2'],
          budgetGlobal: '10000',
          contexte: 'Un contexte de test',
          dateDeCreation: epochTime,
          dateDeDebut: epochTime,
          dateDeFin: epochTime,
          dateDeModification: epochTime,
          description: 'Description de test',
          nom,
          uid: {
            value: 'identifiantPourLaCreation',
          },
          uidEditeur: {
            email: 'martin.tartempion@example.net',
            value: uidEditeur,
          },
          uidFeuilleDeRoute: {
            value: uidFeuilleDeRoute,
          },
          uidPorteur: 'porteurFooId',
        }
      ).state
    )
    expect(result).toBe('OK')
  })

  it.each([
    {
      date: invalidDate,
      expectedFailure: 'dateDeModificationInvalide',
      intention: 'd‘une date de modification invalide',
    },
  ])('étant donné une gouvernance, quand une action est créée par son gestionnaire n‘est pas valide à cause $intention, alors une erreur est renvoyée', async ({ date, expectedFailure }) => {
    // GIVEN
    const ajouterAction = new AjouterUneAction(
      new GouvernanceRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new ActionRepositorySpy(),
      date
    )

    const command = {
      besoins: ['besoin 1'],
      budgetGlobal: '10000',
      contexte: 'Un contexte',
      dateDeDebut: new Date(epochTime).toISOString(),
      dateDeFin: new Date(epochTime).toISOString(),
      description: 'Description',
      nom,
      uidEditeur,
      uidFeuilleDeRoute,
      uidGouvernance,
      uidPorteur,
    }

    // WHEN
    const result = await ajouterAction.handle(command)

    // THEN
    expect(spiedActionToAdd).toBeNull()
    expect(result).toBe(expectedFailure)
  })

  it('étant donné une gouvernance, quand une action est créée par un gestionnaire qui n‘a pas ce droit, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterAction = new AjouterUneAction(
      new GouvernanceRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      new GestionnaireAutreRepositorySpy(),
      new ActionRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterAction.handle({
      besoins: ['besoin 1'],
      budgetGlobal: '10000',
      contexte: 'Un contexte',
      dateDeDebut: new Date(epochTime).toISOString(),
      dateDeFin: new Date(epochTime).toISOString(),
      description: 'Description valide',
      nom,
      uidEditeur,
      uidFeuilleDeRoute,
      uidGouvernance,
      uidPorteur,
    })

    // THEN
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('utilisateurNePeutPasAjouterAction')
  })
})

const uidGouvernance = 'gouvernanceFooId'
const uidEditeur = 'userFooId'
const nom = 'Feuille de route 69'
const uidPorteur = 'porteurFooId'
const uidFeuilleDeRoute = 'feuilleDeRouteFooId'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedGouvernanceToUpdate: Gouvernance | null
let spiedUtilisateurUidToFind: null | string
let spiedFeuilleDeRouteUidToFind: null | string
let spiedActionToAdd: Action | null

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

class FeuilleDeRouteRepositorySpy implements GetFeuilleDeRouteRepository {
  async get(uid: string): Promise<FeuilleDeRoute> {
    spiedFeuilleDeRouteUidToFind = uid
    return Promise.resolve(
      feuilleDeRouteFactory({
        uid: { value: uidFeuilleDeRoute },
      })
    )
  }
}

class GestionnaireRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' }))
  }
}

class GestionnaireAutreRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '10', role: 'Gestionnaire département' }))
  }
}

class ActionRepositorySpy implements AddActionRepository {
  async add(action: Action): Promise<boolean> {
    spiedActionToAdd = action
    return Promise.resolve(true)
  }
}
