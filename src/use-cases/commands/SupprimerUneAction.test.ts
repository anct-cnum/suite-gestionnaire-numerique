import { DropActionRepository, GetActionRepository } from './shared/ActionRepository'
import { DropCoFinancementRepository } from './shared/CoFinancementRepository'
import { GetDemandeDeSubventionRepository } from './shared/DemandeDeSubventionRepository'
import { GetFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { SupprimerUneAction } from './SupprimerUneAction'
import { Action } from '@/domain/Action'
import { CoFinancement } from '@/domain/CoFinancement'
import { DemandeDeSubvention } from '@/domain/DemandeDeSubvention'
import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'
import { actionFactory, demandeDeSubventionFactory, feuilleDeRouteFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('supprimer une action dune feuille de route', () => {
  beforeEach(() => {
    spiedUtilisateurUidToFind = null
    spiedFeuilleDeRouteUidToFind = null
    spiedActionToDrop = null
    spiedDemandeDeSubventionToFind = null
    spiedCoFinancementToDrop = null
    spiedDemandeDeSubventionToDrop = null
  })

  it('quand une action est supprimée par son gestionnaire, alors elle est supprimée', async () => {
    // GIVEN
    const uidAction = 'actionFooId'
    const uidGestionnaire = 'userFooId'
    const uidFeuilleDeRoute = 'feuilleDeRouteFooId'
    const uidDemandeSubvention = 'demandeDeSubventionFooId'
    const supprimer = new SupprimerUneAction(
      new GestionnaireRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      new ActionRepositorySpy(),
      new DemandeDeSubventionDeposeeRepositorySpy(),
      new CoFinancementRepositorySpy()
    )

    // WHEN
    const result = await supprimer.handle({ uidAction, uidGestionnaire })

    // THEN
    expect(spiedActionToDrop?.state.uid.value).toBe(uidAction)
    expect(spiedUtilisateurUidToFind).toBe(uidGestionnaire)
    expect(spiedFeuilleDeRouteUidToFind).toBe(uidFeuilleDeRoute)
    expect(spiedDemandeDeSubventionToFind).toBe(uidAction)
    expect(spiedDemandeDeSubventionToDrop).toBe(uidDemandeSubvention)
    expect(spiedCoFinancementToDrop).toBe(uidAction)
    expect(result).toBe('OK')
  })

  it('quand une action est supprimée par un gestionnaire autre que celui de la gouvernance, alors une erreur est renvoyé', async () => {
    // GIVEN
    const uidGestionnaire = 'userFooId'
    const uidAction = 'actionFooId'
    const supprimer = new SupprimerUneAction(
      new GestionnaireAutreRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      new ActionRepositorySpy(),
      new DemandeDeSubventionDeposeeRepositorySpy(),
      new CoFinancementRepositorySpy()
    )

    // WHEN
    const result = await supprimer.handle({ uidAction, uidGestionnaire })

    // THEN
    expect(result).toBe('suppressionActionNonAutorisee')
  })

  it('quand une action est supprimée par son gestionnaire, mais qu’il existe au moins une demande de subvention déjà traité alors une erreur est renvoyé', async () => {
    // GIVEN
    const uidGestionnaire = 'userFooId'
    const uidAction = 'actionFooId'
    const supprimer = new SupprimerUneAction(
      new GestionnaireRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      new ActionAvecSubventionClosRepositorySpy(),
      new DemandeDeSubventionEnCoursOuClosRepositorySpy(),
      new CoFinancementRepositorySpy()
    )

    // WHEN
    const result = await supprimer.handle({ uidAction, uidGestionnaire })

    // THEN
    expect(result).toBe('conflitExisteSubventionClos')
  })
})

let spiedUtilisateurUidToFind: null | string
let spiedFeuilleDeRouteUidToFind: null | string
const uidFeuilleDeRoute = 'feuilleDeRouteFooId'
let spiedActionToDrop: Action | null
let spiedDemandeDeSubventionToFind: DemandeDeSubvention['uid']['state']['value'] | null
let spiedCoFinancementToDrop: CoFinancement['uid']['state']['value'] | null
let spiedDemandeDeSubventionToDrop: DemandeDeSubvention['state']['uidAction'] | null

class ActionRepositorySpy implements DropActionRepository, GetActionRepository {
  async drop(action: Action): Promise<boolean> {
    spiedActionToDrop = action
    return Promise.resolve(true)
  }

  async get(action: Action['uid']['state']['value']): Promise<Action> {
    return Promise.resolve(actionFactory({
      uid: {
        value: action,
      },
      uidFeuilleDeRoute: {
        value: 'feuilleDeRouteFooId',
      },
    }))
  }
}

class ActionAvecSubventionClosRepositorySpy implements DropActionRepository, GetActionRepository {
  async drop(action: Action): Promise<boolean> {
    spiedActionToDrop = action
    return Promise.resolve(true)
  }

  async get(action: Action['uid']['state']['value']): Promise<Action> {
    return Promise.resolve(actionFactory({
      uid: {
        value: action,
      },
      uidFeuilleDeRoute: {
        value: 'feuilleDeRouteFooId',
      },
    }))
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

class DemandeDeSubventionDeposeeRepositorySpy implements GetDemandeDeSubventionRepository {
  async drop(uidAction: DemandeDeSubvention['state']['uidAction']): Promise<boolean> {
    spiedDemandeDeSubventionToDrop = uidAction
    return Promise.resolve(true)
  }

  async get(uid: DemandeDeSubvention['uid']['state']['value']): Promise<DemandeDeSubvention> {
    spiedDemandeDeSubventionToFind = uid
    return Promise.resolve(
      demandeDeSubventionFactory({ statut: 'deposee' })
    )
  }
}

class DemandeDeSubventionEnCoursOuClosRepositorySpy implements GetDemandeDeSubventionRepository {
  async drop(uidAction: DemandeDeSubvention['state']['uidAction']): Promise<boolean> {
    spiedDemandeDeSubventionToDrop = uidAction
    return Promise.resolve(true)
  }

  async get(uid: DemandeDeSubvention['uid']['state']['value']): Promise<DemandeDeSubvention> {
    spiedDemandeDeSubventionToFind = uid
    return Promise.resolve(
      demandeDeSubventionFactory({ statut: 'en_cours' })
    )
  }
}

class CoFinancementRepositorySpy implements DropCoFinancementRepository {
  async drop(uidAction: CoFinancement['uid']['state']['value']): Promise<boolean> {
    spiedCoFinancementToDrop = uidAction
    return Promise.resolve(true)
  }
}
