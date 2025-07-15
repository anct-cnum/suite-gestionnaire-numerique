import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { SupprimerUneNoteDeContextualisation } from './SupprimerUneNoteDeContextextualisation'
import { FeuilleDeRoute, FeuilleDeRouteUid } from '@/domain/FeuilleDeRoute'
import { feuilleDeRouteFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('supprimer une note de contextualisation d’une feuille de route', () => {
  beforeEach(() => {
    spiedFeuilleDeRouteUidToFind = null
    spiedFeuilleDeRouteToUpdate = null
    spiedUtilisateurUidToFind = null
  })

  it('quand une note de contextualisation est supprimée par son gestionnaire, alors elle est supprimée', async () => {
    // GIVEN
    const uidEditeur = 'userFooId2'
    const supprimerNoteDeContexte = new SupprimerUneNoteDeContextualisation(
      new FeuilleDeRouteRepositorySpy(),
      new GestionnaireRepositorySpy()
    )

    // WHEN
    const result = await supprimerNoteDeContexte.handle({
      uidEditeur,
      uidFeuilleDeRoute,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedFeuilleDeRouteUidToFind).toStrictEqual(new FeuilleDeRouteUid(uidFeuilleDeRoute).state.value)
    expect(spiedFeuilleDeRouteToUpdate?.state).toStrictEqual(
      feuilleDeRouteFactory({
        noteDeContextualisation: undefined,
        uid: { value: uidFeuilleDeRoute },
      }).state
    )
    expect(result).toBe('OK')
  })

  it('quand un note de contextualisation est supprimée par un gestionnaire qui n’a pas ce droit, alors une erreur est renvoyée', async () => {
    // GIVEN
    const supprimerNoteDeContexte = new SupprimerUneNoteDeContextualisation(
      new FeuilleDeRouteRepositorySpy(),
      new GestionnaireAutreRepositorySpy()
    )

    // WHEN
    const result = await supprimerNoteDeContexte.handle({ uidEditeur: 'utilisateurUsurpateur', uidFeuilleDeRoute })

    // THEN
    expect(spiedFeuilleDeRouteToUpdate).toBeNull()
    expect(result).toBe('editeurNePeutPasSupprimerNoteDeContextualisation')
  })
})

const uidFeuilleDeRoute = 'feuilleDeRouteFooId'
let spiedFeuilleDeRouteUidToFind: FeuilleDeRoute['uid']['state']['value'] | null
let spiedFeuilleDeRouteToUpdate: FeuilleDeRoute | null
let spiedUtilisateurUidToFind: null | string

class FeuilleDeRouteRepositorySpy implements GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository {
  async get(uid: FeuilleDeRoute['uid']['state']['value']): Promise<FeuilleDeRoute> {
    spiedFeuilleDeRouteUidToFind = uid
    return Promise.resolve(
      feuilleDeRouteFactory({
        noteDeContextualisation: undefined,
        uid: { value: uidFeuilleDeRoute },
        uidGouvernance: {
          value: 'gouvernanceFooId',
        },
      })
    )
  }

  async update(feuilleDeRoute: FeuilleDeRoute): Promise<void> {
    spiedFeuilleDeRouteToUpdate = feuilleDeRoute
    return Promise.resolve()
  }
}

class GestionnaireRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({ codeOrganisation: 'gouvernanceFooId', role: 'Gestionnaire département' }))
  }
}

class GestionnaireAutreRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '10', role: 'Gestionnaire département' }))
  }
}

