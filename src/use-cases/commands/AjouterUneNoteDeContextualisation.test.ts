import { AjouterUneNoteDeContextualisation } from './AjouterUneNoteDeContextualisation'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'
import { feuilleDeRouteFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

describe('ajouter une note de contextualisation à une feuille de route', () => {
  beforeEach(() => {
    spiedFeuilleDeRouteUidToFind = null
    spiedFeuilleDeRouteToUpdate = null
    spiedUtilisateurUidToFind = null
  })

  it('étant donné une feuille de route, quand une note de contextualisation est créée par son gestionnaire, alors elle est ajoutée à cette feuille de route', async () => {
    // GIVEN
    const ajouterNoteDeContextualisation = new AjouterUneNoteDeContextualisation(
      new FeuilleDeRouteRepositorySpy(),
      new GestionnaireRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNoteDeContextualisation.handle({
      contenu,
      uidEditeur,
      uidFeuilleDeRoute,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedFeuilleDeRouteUidToFind).toBe(uidFeuilleDeRoute)

    expect(result).toBe('OK')
    expect(spiedFeuilleDeRouteToUpdate?.state).toStrictEqual(
      feuilleDeRouteFactory({
        noteDeContextualisation:contenu,
        uid: { value: uidFeuilleDeRoute },
      }).state
    )
    expect(result).toBe('OK')
  })

  it('étant donné une feuille de route, quand une note de contextualisation est créée par un gestionnaire qui n\'a pas ce droit, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNoteDeContextualisation = new AjouterUneNoteDeContextualisation(
      new FeuilleDeRouteRepositorySpy(),
      new GestionnaireAutreRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNoteDeContextualisation.handle({ contenu, uidEditeur: 'utilisateurUsurpateur', uidFeuilleDeRoute })

    // THEN
    expect(spiedFeuilleDeRouteToUpdate).toBeNull()
    expect(result).toBe('utilisateurNePeutPasAjouterNoteDeContextualisation')
  })

  it('étant donné une feuille de route, quand une note de contextualisation est créée par un gestionnaire département mais qu\'une note de contextualisation existe déjà, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNoteDeContextualisation = new AjouterUneNoteDeContextualisation(
      new FeuilleDeRouteAvecNoteDeContextualisationRepositorySpy(),
      new GestionnaireRepositorySpy(),
      epochTime
    )

    // WHEN
    const result = await ajouterNoteDeContextualisation.handle({ contenu, uidEditeur, uidFeuilleDeRoute })

    // THEN
    expect(spiedFeuilleDeRouteToUpdate).toBeNull()
    expect(result).toBe('noteDeContextualisationDejaExistante')
  })
})

const contenu = 'Lorem ipsum dolor sit amet consectetur. Sagittis dui sapien libero tristique leo tortor.'
const uidFeuilleDeRoute = 'feuilleDeRouteFooId'
const uidEditeur = 'userFooId'
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
      })
    )
  }

  async update(feuilleDeRoute: FeuilleDeRoute): Promise<void> {
    spiedFeuilleDeRouteToUpdate = feuilleDeRoute
    return Promise.resolve()
  }
}

class FeuilleDeRouteAvecNoteDeContextualisationRepositorySpy extends FeuilleDeRouteRepositorySpy {
  override async get(uid: FeuilleDeRoute['uid']['state']['value']): Promise<FeuilleDeRoute> {
    spiedFeuilleDeRouteUidToFind = uid
    return Promise.resolve(
      feuilleDeRouteFactory({
        noteDeContextualisation: '<p>Note de contextualisation</p>',
        uidGouvernance: {
          value: 'gouvernanceFooId',
        },
      })
    )
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
