import { FindGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { SupprimerUneNoteDeContexte } from './SupprimerUneNoteDeContexte'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUid, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime } from '@/shared/testHelper'

describe('supprimer une note de contexte d’une gouvernance', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedGouvernanceToUpdate = null
    spiedUtilisateurUidToFind = null
  })

  it('étant donné une gouvernance existante, quand une note de contexte est supprimée par son gestionnaire, alors elle est supprimée', async () => {
    // GIVEN
    const uidEditeur = 'userFooId2'
    const supprimerNoteDeContexte = new SupprimerUneNoteDeContexte(
      new GouvernanceRepositorySpy(),
      new GestionnaireRepositorySpy()
    )

    // WHEN
    const result = await supprimerNoteDeContexte.execute({
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate?.state).toStrictEqual(
      gouvernanceFactory({
        noteDeContexte: undefined,
        uid: uidGouvernance,
      }).state
    )
    expect(result).toBe('OK')
  })

  it('étant donné une gouvernance existante, quand un note de contexte est supprimée par un gestionnaire qui n’a pas ce droit, alors une erreur est renvoyée', async () => {
    // GIVEN
    const supprimerNoteDeContexte = new SupprimerUneNoteDeContexte(
      new GouvernanceRepositorySpy(),
      new GestionnaireAutreRepositorySpy()
    )

    // WHEN
    const result = await supprimerNoteDeContexte.execute({ uidEditeur: 'utilisateurUsurpateur', uidGouvernance })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe('utilisateurUsurpateur')
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('editeurNePeutPasSupprimerNoteDeContexte')
  })

  it('étant donné une gouvernance inexistante, quand une note de contexte est supprimée, alors une erreur est renvoyée', async () => {
    // GIVEN
    const supprimerNoteDeContexte = new SupprimerUneNoteDeContexte(
      new GouvernanceInexistanteRepositorySpy(),
      new GestionnaireRepositorySpy()
    )

    // WHEN
    const result = await supprimerNoteDeContexte.execute({
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('gouvernanceInexistante')
  })

  it('étant donné un utilisateur inexistant, quand une note de contexte est supprimée, alors une erreur est renvoyée', async () => {
    // GIVEN
    const supprimerNoteDeContexte = new SupprimerUneNoteDeContexte(
      new GouvernanceInexistanteRepositorySpy(),
      new GestionnaireInexistantRepositorySpy()
    )

    // WHEN
    const result = await supprimerNoteDeContexte.execute({
      uidEditeur,
      uidGouvernance,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidEditeur)
    expect(spiedGouvernanceUidToFind).toBeNull()
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('editeurInexistant')
  })
})

const uidGouvernance = 'gouvernanceFooId'
const emailEditeur = 'martin.tartempion@example.com'
const uidEditeur = 'userFooId'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedGouvernanceToUpdate: Gouvernance | null
let spiedUtilisateurUidToFind: string | null

class GouvernanceRepositorySpy implements FindGouvernanceRepository, UpdateGouvernanceRepository {
  async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(
      gouvernanceFactory({
        departement: {
          code: '75',
          codeRegion: '11',
          nom: 'Paris',
        },
        noteDeContexte: {
          contenu: '<p>un contenu<p>',
          dateDeModification: epochTime,
          uidEditeur: new UtilisateurUid(
            utilisateurFactory({ uid: { email: emailEditeur, value: uidEditeur } }).state.uid
          ),
        },
        uid: uidGouvernance,
      })
    )
  }

  async update(gouvernance: Gouvernance): Promise<void> {
    spiedGouvernanceToUpdate = gouvernance
    return Promise.resolve()
  }
}

class GouvernanceInexistanteRepositorySpy extends GouvernanceRepositorySpy {
  override async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(null)
  }
}

class GestionnaireRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({
      codeOrganisation: '75',
      role: 'Gestionnaire département',
      uid: { email: 'michel.tartempion@example.net', value: 'userFooId2' },
    }))
  }
}

class GestionnaireInexistantRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(null)
  }
}

class GestionnaireAutreRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({ codeOrganisation: '10', role: 'Gestionnaire département' }))
  }
}
