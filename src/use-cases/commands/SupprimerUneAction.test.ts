import { Utilisateur, UtilisateurUidState } from "@/domain/Utilisateur"
import { SupprimerUneAction } from "./SupprimerUneAction"
import { GetUtilisateurRepository } from "./shared/UtilisateurRepository"
import { utilisateurFactory, actionFactory, feuilleDeRouteFactory } from "@/domain/testHelper"
import { DropActionRepository, GetActionRepository } from "./shared/ActionRepository"
import { Action } from "@/domain/Action"
import { FeuilleDeRoute } from "@/domain/FeuilleDeRoute"
import { GetFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'

describe('supprimer une action dune feuille de route', () => {
  beforeEach(() => {
    spiedUtilisateurUidToFind = null
    spiedFeuilleDeRouteUidToFind = null
    spiedActionToDrop = null
  })

  it('quand une action est supprimée par son gestionnaire, alors elle est supprimée', async() => {
    // GIVEN
    const uidAction = 'actionFooId'
    const uidGestionnaire = 'userFooId'
    const uidFeuilleDeRoute = 'feuilleDeRouteFooIdcoucou'
    const supprimer = new SupprimerUneAction(
      new GestionnaireRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      new ActionRepositorySpy()
    )

    // WHEN
    const result = await supprimer.handle({ uidAction, uidGestionnaire})

    // THEN
    expect(spiedActionToDrop?.state.uid.value).toBe(uidAction)
    expect(spiedUtilisateurUidToFind).toBe(uidGestionnaire)
    expect(spiedFeuilleDeRouteUidToFind).toBe(uidFeuilleDeRoute)
    expect(result).toBe('OK')
  })

  it('quand une action est supprimée par un gestionnaire qui n’est pas membre coporteur, alors une erreur est renvoyé', async () => {
    // GIVEN
    const uidGestionnaire = 'userFooId'
    const uidAction = 'actionFooId'
    const supprimer = new SupprimerUneAction(
      new GestionnaireMemeDepartementMembreNonCoPorteurRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      new ActionNonEligibleALaSuppressionRepositorySpy()
    )

    // WHEN
    const result = await supprimer.handle({ uidAction, uidGestionnaire })
    // THEN
    expect(result).toBe('ActionNonEligibleALaSuppression')
  })

  it('quand une action est supprimée par un gestionnaire autre que celui de la gouvernance, alors une erreur est renvoyé', async () => {
    // GIVEN
    const uidGestionnaire = 'userFooId'
    const uidAction = 'actionFooId'
    const supprimer = new SupprimerUneAction(
      new GestionnaireAutreRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      new ActionRepositorySpy()
    )

    // WHEN
    const result = await supprimer.handle({ uidAction, uidGestionnaire })
    // THEN
    expect(result).toBe('suppressionActionNonAutorisee')
  })

})
let spiedUtilisateurUidToFind: null | string
let spiedFeuilleDeRouteUidToFind: null | string
const uidFeuilleDeRoute = 'feuilleDeRouteFooId'
let spiedActionToDrop: Action | null

class ActionRepositorySpy implements DropActionRepository, GetActionRepository {
  async get(action: Action['uid']): Promise<Action> {
    return Promise.resolve(actionFactory({
      uid: {
        value: action.state.value,
      },
      uidFeuilleDeRoute: {
        value: 'feuilleDeRouteFooIdcoucou',
      },
    }))
  }
  async drop(action: Action): Promise<boolean> {
    spiedActionToDrop = action
    return Promise.resolve(true)
  }
}

class ActionNonEligibleALaSuppressionRepositorySpy implements DropActionRepository, GetActionRepository {
  async get(action: Action['uid']): Promise<Action> {
    return Promise.resolve(actionFactory({
      uid: {
        value: action.state.value,
      },
    }))
  }
  async drop(action: Action): Promise<boolean> {
    spiedActionToDrop = action
    return Promise.resolve(true)
  }
}

class GestionnaireRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({
      codeOrganisation: '75',
      role: 'Gestionnaire département',
      uid: { email: 'michel.tartempion@example.net', value: 'userFooId2' },
    }))
  }
}
class GestionnaireMemeDepartementMembreNonCoPorteurRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({
      codeOrganisation: '75',
      role: 'Gestionnaire région',
      uid: { email: 'michel.tartempion@example.net', value: 'userFooId3' },
    }))
  }
}

class GestionnaireAutreRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({
      codeOrganisation: '69',
      role: 'Gestionnaire département',
      uid: { email: 'michel.tartempion@example.net', value: 'userFooIdAutre' },
    }))
  }
}

class FeuilleDeRouteRepositorySpy implements GetFeuilleDeRouteRepository {
  async get(uid: string): Promise<FeuilleDeRoute> {
    spiedFeuilleDeRouteUidToFind = uid
    return Promise.resolve(
      feuilleDeRouteFactory({
        uid: { value: uidFeuilleDeRoute },
        uidGouvernance: {
          value: '75',
        },
      })
    )
  }
}
