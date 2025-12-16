import { ModifierUneNoteDeContextualisation } from './ModifierUneNoteDeContextualisation'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { feuilleDeRouteFactory, gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

describe('modifier une note de contextualisation', () => {
  beforeEach(() => {
    spiedFeuilleDeRouteUidToFind = null
    spiedFeuilleDeRouteUidToUpdate = null
    spiedUtilisateurUidToFind = null
  })

  it('quand une note de contextualisation est modifiée par son gestionnaire, alors elle est modifiée', async () => {
    // GIVEN
    const modifierUneNoteDeContextualisationDemandesDeSubvention = new ModifierUneNoteDeContextualisation(
      new FeuilleDeRouteRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      epochTime
    )
    // WHEN
    const result = await modifierUneNoteDeContextualisationDemandesDeSubvention.handle({
      contenu,
      uidEditeur,
      uidFeuilleDeRoute,
    })
    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedFeuilleDeRouteUidToFind).toStrictEqual(uidFeuilleDeRoute)
    expect(spiedFeuilleDeRouteUidToUpdate?.state).toStrictEqual(
      feuilleDeRouteFactory({
        noteDeContextualisation: '<p>Lorem ipsum dolor sit amet consectetur. Sagittis dui sapien libero tristique leo tortor.<p>',
        uidGouvernance: {
          value: '75',
        },
      }).state
    )
    expect(result).toBe('OK')
  })

  it('quand une note de contextualisation est modifiée par un gestionnaire non autorisé, alors une erreur est renvoyée', async () => {
    // GIVEN
    const modifierUneNoteDeContextualisationDemandesDeSubvention = new ModifierUneNoteDeContextualisation(
      new FeuilleDeRouteRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new GestionnaireAutreRepositorySpy(),
      epochTime
    )
    // WHEN
    const result = await modifierUneNoteDeContextualisationDemandesDeSubvention.handle({
      contenu,
      uidEditeur,
      uidFeuilleDeRoute,
    })
    // THEN
    expect(spiedFeuilleDeRouteUidToUpdate).toBeNull()
    expect(result).toBe('utilisateurNePeutPasModifierNoteDeContextualisation')
  })

  it('quand une note de contextualisation est modifiée sur une feuille de route existante mais qui appartient à une autre gouvernance, alors une erreur est renvoyée', async () => {
    // GIVEN
    const modifierUneNoteDeContextualisationDemandesDeSubvention = new ModifierUneNoteDeContextualisation(
      new FeuilleDeRouteAvecNoteDeContextualisationAutreGouvernanceRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      epochTime
    )
    // WHEN
    const result = await modifierUneNoteDeContextualisationDemandesDeSubvention.handle({
      contenu,
      uidEditeur,
      uidFeuilleDeRoute,
    })
    // THEN
    expect(spiedFeuilleDeRouteUidToUpdate).toBeNull()
    expect(result).toBe('utilisateurNePeutPasModifierNoteDeContextualisation')
  })

  it('quand une note de contextualisation est modifiée sur une feuille de route inexistante, alors une erreur est renvoyée', async () => {
    // GIVEN
    const modifierUneNoteDeContextualisationDemandesDeSubvention = new ModifierUneNoteDeContextualisation(
      new FeuilleDeRouteSansNoteDeContextualisationRepositorySpy(),
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy(),
      epochTime
    )
    // WHEN
    const result = await modifierUneNoteDeContextualisationDemandesDeSubvention.handle({
      contenu,
      uidEditeur,
      uidFeuilleDeRoute,
    })
    // THEN
    expect(spiedFeuilleDeRouteUidToUpdate).toBeNull()
    expect(result).toBe('noteDeContextualisationInexistante')
  })
})

const contenu = '<p>Lorem ipsum dolor sit amet consectetur. Sagittis dui sapien libero tristique leo tortor.<p>'
const uidFeuilleDeRoute = 'gouvernanceFooId'
const uidEditeur = 'userFooId'
let spiedFeuilleDeRouteUidToFind: FeuilleDeRoute['uid']['state']['value'] | null
let spiedFeuilleDeRouteUidToUpdate: FeuilleDeRoute | null
let spiedUtilisateurUidToFind: null | string

class FeuilleDeRouteRepositorySpy implements GetFeuilleDeRouteRepository ,UpdateFeuilleDeRouteRepository{
  async get(uid: FeuilleDeRoute['uid']['state']['value']): Promise<FeuilleDeRoute> {
    spiedFeuilleDeRouteUidToFind = uid
    return Promise.resolve(
      feuilleDeRouteFactory({
        noteDeContextualisation: '<p>contentu</p>',
        uidGouvernance: {
          value: '75',
        },
      })
    )
  }

  async update(feuilleDeRoute: FeuilleDeRoute): Promise<void> {
    spiedFeuilleDeRouteUidToUpdate = feuilleDeRoute
    return Promise.resolve()
  }
}

class FeuilleDeRouteSansNoteDeContextualisationRepositorySpy implements GetFeuilleDeRouteRepository {
  async get(uid: FeuilleDeRoute['uid']['state']['value']): Promise<FeuilleDeRoute> {
    spiedFeuilleDeRouteUidToFind = uid
    return Promise.resolve(
      feuilleDeRouteFactory({
        noteDeContextualisation: undefined,
        uidGouvernance: {
          value: '75',
        },
      })
    )
  }

  async update(feuilleDeRoute: FeuilleDeRoute): Promise<void> {
    spiedFeuilleDeRouteUidToUpdate = feuilleDeRoute
    return Promise.resolve()
  }
}

class FeuilleDeRouteAvecNoteDeContextualisationAutreGouvernanceRepositorySpy implements GetFeuilleDeRouteRepository {
  async get(uid: FeuilleDeRoute['uid']['state']['value']): Promise<FeuilleDeRoute> {
    spiedFeuilleDeRouteUidToFind = uid
    return Promise.resolve(
      feuilleDeRouteFactory({
        noteDeContextualisation: '<p>Note de contextualisation</p>',
        uidGouvernance: {
          value: '69',
        },
      })
    )
  }

  async update(feuilleDeRoute: FeuilleDeRoute): Promise<void> {
    spiedFeuilleDeRouteUidToUpdate = feuilleDeRoute
    return Promise.resolve()
  }
}

class GestionnaireRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({
      codeOrganisation: '75',
      role: 'Gestionnaire département',
      uid: { email: 'michel.tartempion@example.net', value: 'userFooId' },
    }))
  }
}

class GestionnaireAutreRepositorySpy implements GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '10', role: 'Gestionnaire département' }))
  }
}

class GouvernanceRepositorySpy implements GetGouvernanceRepository {
  async get(uid: GouvernanceUid): Promise<Gouvernance> {
    return Promise.resolve(gouvernanceFactory({ uid: uid.state.value }))
  }
}
