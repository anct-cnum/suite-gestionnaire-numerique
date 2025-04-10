import { ModifierUneNoteDeContextualisation } from './ModifierUneNoteDeContextualisation'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { FeuilleDeRoute, FeuilleDeRouteUid } from '@/domain/FeuilleDeRoute'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { feuilleDeRouteFactory, gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUid, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

describe('modifier une note de contextualisation', () => {
  beforeEach(() => {
    spiedFeuilleDeRouteUidToFind = null
    spiedGouvernanceUidToFind = null
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
    expect(spiedGouvernanceUidToFind?.state.value).toBe(uidGouvernance)
    expect(spiedFeuilleDeRouteUidToFind?.state.value).toStrictEqual(uidFeuilleDeRoute)
    expect(spiedFeuilleDeRouteUidToUpdate?.state).toStrictEqual(
      feuilleDeRouteFactory({
        noteDeContextualisation: {
          contenu,
          dateDeModification: epochTime,
          uidEditeur: new UtilisateurUid(
            utilisateurFactory({ uid: { email: emailEditeur, value: uidEditeur } }).state.uid
          ),
        },
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

const contenu = 'Lorem ipsum dolor sit amet consectetur. Sagittis dui sapien libero tristique leo tortor.'
const uidFeuilleDeRoute = 'gouvernanceFooId'
const uidGouvernance = 'gouvernanceFooId'
const emailEditeur = 'martin.tartempion@example.com'
const uidEditeur = 'userFooId'
let spiedFeuilleDeRouteUidToFind: FeuilleDeRouteUid | null
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedFeuilleDeRouteUidToUpdate: FeuilleDeRoute | null
let spiedUtilisateurUidToFind: null | string

class FeuilleDeRouteRepositorySpy implements GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository {
  async get(uid: FeuilleDeRouteUid): Promise<FeuilleDeRoute> {
    spiedFeuilleDeRouteUidToFind = uid
    return Promise.resolve(
      feuilleDeRouteFactory({
        noteDeContextualisation: {
          contenu: 'un contenu',
          dateDeModification: epochTime,
          uidEditeur: new UtilisateurUid(
            utilisateurFactory({ uid: { email: emailEditeur, value: uidEditeur } }).state.uid
          ),
        },
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

class FeuilleDeRouteSansNoteDeContextualisationRepositorySpy extends FeuilleDeRouteRepositorySpy {
  override async get(uid: FeuilleDeRouteUid): Promise<FeuilleDeRoute> {
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
}

class FeuilleDeRouteAvecNoteDeContextualisationAutreGouvernanceRepositorySpy extends FeuilleDeRouteRepositorySpy {
  override async get(uid: FeuilleDeRouteUid): Promise<FeuilleDeRoute> {
    spiedFeuilleDeRouteUidToFind = uid
    return Promise.resolve(
      feuilleDeRouteFactory({
        noteDeContextualisation: {
          contenu: 'un contenu',
          dateDeModification: epochTime,
          uidEditeur: new UtilisateurUid(
            utilisateurFactory({ uid: { email: emailEditeur, value: uidEditeur } }).state.uid
          ),
        },
        uidGouvernance: {
          value: '69',
        },
      })
    )
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
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(
      gouvernanceFactory({
        departement: {
          code: '75',
          codeRegion: '11',
          nom: 'Paris',
        },
        noteDeContexte: undefined,
        uid: uidGouvernance,
      })
    )
  }
}
