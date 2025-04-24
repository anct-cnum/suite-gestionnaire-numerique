import { Utilisateur, UtilisateurUidState } from "@/domain/Utilisateur"
import { SupprimerUneAction } from "./SupprimerUneAction"
import { GetUtilisateurRepository } from "./shared/UtilisateurRepository"
import { utilisateurFactory } from "@/domain/testHelper"
import { DropActionRepository } from "./shared/ActionRepository"
import { Action } from "@/domain/Action"

describe('supprimer une action dune feuille de route', () => {
  it('quand une action est supprimée par son gestionnaire, alors elle est supprimée', async() => {
    // GIVEN
    const uidGestionnaire = 'userFooId'
    const uidAction = 'actionFooId'
    const supprimer = new SupprimerUneAction(
      new GestionnaireRepositorySpy(),
      new ActionRepositorySpy()
    )

    // WHEN
    const result = await supprimer.handle({uidAction, uidGestionnaire})
    // THEN
    expect(result).toBe('OK')
  })
})
let spiedUtilisateurUidToFind: null | string
let spiedFeuilleDeRouteUidToFind: null | string
let spiedActionToDrop: Action | null

class ActionRepositorySpy implements DropActionRepository {
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
