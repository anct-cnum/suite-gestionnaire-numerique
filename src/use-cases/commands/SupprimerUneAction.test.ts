import { beforeEach, describe, expect, it } from 'vitest'

import { GetActionRepository, SupprimerActionRepository } from './shared/ActionRepository'
import { GetDemandeDeSubventionRepository } from './shared/DemandeDeSubventionRepository'
import { GetFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { SupprimerUneAction } from './SupprimerUneAction'
import { Action, ActionUid } from '@/domain/Action'
import { DemandeDeSubvention, StatutSubvention } from '@/domain/DemandeDeSubvention'
import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import {
  actionFactory,
  demandeDeSubventionFactory,
  feuilleDeRouteFactory,
  gouvernanceFactory,
  utilisateurFactory,
} from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('supprimer une action', () => {
  beforeEach(() => {
    spiedActionUidToFind = null
    spiedFeuilleDeRouteUidToFind = null
    spiedGouvernanceUidToFind = null
    spiedUtilisateurUidToFind = null
    spiedDemandeDeSubventionUidToFind = null
    spiedActionUidToDelete = null
    statutDemandeDeSubvention = StatutSubvention.DEPOSEE
    resultatSuppression = true
  })

  it('quand une action est supprimée par un gestionnaire de la gouvernance à laquelle elle est rattachée, alors elle est supprimée', async () => {
    // GIVEN
    const supprimerUneAction = new SupprimerUneAction(
      new ActionRepositorySpy(),
      new DemandeDeSubventionRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy()
    )

    // WHEN
    const result = await supprimerUneAction.handle({ uidActionASupprimer: uidAction, uidEditeur })

    // THEN
    expect(spiedActionUidToFind).toBe(uidAction)
    expect(spiedFeuilleDeRouteUidToFind).toBe(uidFeuilleDeRoute)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedDemandeDeSubventionUidToFind).toBe(uidDemandeDeSubvention)
    expect(spiedActionUidToDelete?.state).toStrictEqual(new ActionUid(uidAction).state)
    expect(result).toBe('OK')
  })

  it('quand une action est supprimée par un gestionnaire d’un autre département, alors une erreur est renvoyée et rien n’est supprimé', async () => {
    // GIVEN
    const supprimerUneAction = new SupprimerUneAction(
      new ActionRepositorySpy(),
      new DemandeDeSubventionRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new GestionnaireAutreRepositorySpy()
    )

    // WHEN
    const result = await supprimerUneAction.handle({ uidActionASupprimer: uidAction, uidEditeur })

    // THEN
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedDemandeDeSubventionUidToFind).toBeNull()
    expect(spiedActionUidToDelete).toBeNull()
    expect(result).toBe('suppressionActionNonAutorisee')
  })

  it('quand la demande de subvention de l’action a dépassé le statut déposée, alors une erreur est renvoyée et rien n’est supprimé', async () => {
    // GIVEN
    statutDemandeDeSubvention = StatutSubvention.ACCEPTEE
    const supprimerUneAction = new SupprimerUneAction(
      new ActionRepositorySpy(),
      new DemandeDeSubventionRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy()
    )

    // WHEN
    const result = await supprimerUneAction.handle({ uidActionASupprimer: uidAction, uidEditeur })

    // THEN
    expect(spiedActionUidToDelete).toBeNull()
    expect(result).toBe('existeSubventionNonSupprimable')
  })

  it('quand la suppression échoue en base, alors une erreur inconnue est renvoyée', async () => {
    // GIVEN
    resultatSuppression = false
    const supprimerUneAction = new SupprimerUneAction(
      new ActionRepositorySpy(),
      new DemandeDeSubventionRepositorySpy(),
      new FeuilleDeRouteRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy()
    )

    // WHEN
    const result = await supprimerUneAction.handle({ uidActionASupprimer: uidAction, uidEditeur })

    // THEN
    expect(result).toBe('supprimerActionErreurInconnue')
  })
})

const uidAction = 'actionFooId'
const uidFeuilleDeRoute = 'feuilleDeRouteFooId'
const uidGouvernance = 'gouvernanceFooId'
const uidDemandeDeSubvention = 'demandeDeSubventionFooId'
const uidEditeur = 1
let spiedActionUidToFind: Action['uid']['state']['value'] | null
let spiedFeuilleDeRouteUidToFind: FeuilleDeRoute['uid']['state']['value'] | null
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedUtilisateurUidToFind: null | UtilisateurUidState['value']
let spiedDemandeDeSubventionUidToFind: DemandeDeSubvention['uid']['state']['value'] | null
let spiedActionUidToDelete: ActionUid | null
let statutDemandeDeSubvention: StatutSubvention
let resultatSuppression: boolean

class ActionRepositorySpy implements GetActionRepository, SupprimerActionRepository {
  async get(uid: Action['uid']['state']['value']): Promise<Action> {
    spiedActionUidToFind = uid
    return Promise.resolve(
      actionFactory({
        demandeDeSubventionUid: uidDemandeDeSubvention,
        uid: { value: uidAction },
        uidFeuilleDeRoute: { value: uidFeuilleDeRoute },
      })
    )
  }

  async supprimer(actionId: ActionUid): Promise<boolean> {
    spiedActionUidToDelete = actionId
    return Promise.resolve(resultatSuppression)
  }
}

class DemandeDeSubventionRepositorySpy implements GetDemandeDeSubventionRepository {
  async get(uid: DemandeDeSubvention['uid']['state']['value']): Promise<DemandeDeSubvention> {
    spiedDemandeDeSubventionUidToFind = uid
    return Promise.resolve(
      demandeDeSubventionFactory({
        statut: statutDemandeDeSubvention,
        uid: { value: uidDemandeDeSubvention },
        uidAction: { value: uidAction },
      })
    )
  }
}

class FeuilleDeRouteRepositorySpy implements GetFeuilleDeRouteRepository {
  async get(uid: FeuilleDeRoute['uid']['state']['value']): Promise<FeuilleDeRoute> {
    spiedFeuilleDeRouteUidToFind = uid
    return Promise.resolve(
      feuilleDeRouteFactory({
        uid: { value: uidFeuilleDeRoute },
        uidGouvernance: { value: uidGouvernance },
      })
    )
  }
}

class GouvernanceRepositorySpy implements GetGouvernanceRepository {
  async get(uid: GouvernanceUid): Promise<Gouvernance> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(gouvernanceFactory({ uid: uidGouvernance }))
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
