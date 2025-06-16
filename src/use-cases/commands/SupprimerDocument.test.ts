import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { SupprimerDocument } from './SupprimerDocument'
import { Document, FeuilleDeRoute, FeuilleDeRouteUid } from '@/domain/FeuilleDeRoute'
import { feuilleDeRouteFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

describe('supprimer un document d‘une feuille de route', () => {
  beforeEach(() => {
    spiedFeuilleDeRouteUidToFind = null
    spiedFeuilleDeRouteToUpdate = null
    spiedUtilisateurUidToFind = null
  })

  it('quand un document est supprimé par son gestionnaire, alors il est supprimé', async () => {
    // GIVEN
    const uidEditeur = 'userFooId2'
    const supprimerDocument = new SupprimerDocument(
      new FeuilleDeRouteRepositorySpy(),
      new GestionnaireRepositorySpy()
    )

    // WHEN
    const result = await supprimerDocument.handle({
      date: epochTime.toISOString(),
      uidEditeur,
      uidFeuilleDeRoute,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedFeuilleDeRouteUidToFind).toStrictEqual(new FeuilleDeRouteUid(uidFeuilleDeRoute).state.value)
    expect(spiedFeuilleDeRouteToUpdate?.state.document).toBeUndefined()
    expect(result).toBe('OK')
  })

  it('quand un document est supprimé par un gestionnaire qui n‘a pas ce droit, alors une erreur est renvoyée', async () => {
    // GIVEN
    const supprimerDocument = new SupprimerDocument(
      new FeuilleDeRouteRepositorySpy(),
      new GestionnaireAutreRepositorySpy()
    )

    // WHEN
    const result = await supprimerDocument.handle({ date: epochTime.toISOString(), uidEditeur: 'utilisateurUsurpateur', uidFeuilleDeRoute })

    // THEN
    expect(spiedFeuilleDeRouteToUpdate).toBeNull()
    expect(result).toBe('editeurNePeutPasSupprimerDocument')
  })
})

const uidFeuilleDeRoute = 'feuilleDeRouteFooId'
let spiedFeuilleDeRouteUidToFind: FeuilleDeRoute['uid']['state']['value'] | null
let spiedFeuilleDeRouteToUpdate: FeuilleDeRoute | null
let spiedUtilisateurUidToFind: null | string

const mockDocument: Document = {
  chemin: '/api/document-feuille-de-route/user/fooId/feuille-de-route-fake.pdf',
  nom: 'feuille-de-route-fake.pdf',
}

class FeuilleDeRouteRepositorySpy implements GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository {
  async get(uid: FeuilleDeRoute['uid']['state']['value']): Promise<FeuilleDeRoute> {
    spiedFeuilleDeRouteUidToFind = uid
    return Promise.resolve(
      feuilleDeRouteFactory({
        document: mockDocument,
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
