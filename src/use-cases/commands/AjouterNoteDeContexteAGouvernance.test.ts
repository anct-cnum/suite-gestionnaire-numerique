import { AjouterNoteDeContexteAGouvernance } from './AjouterNoteDeContexteAGouvernance'
import { FindGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { gouvernanceFactory, utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUid, UtilisateurUidState } from '@/domain/Utilisateur'

describe('ajouter une note de contexte à une gouvernance', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedGouvernanceToUpdate = null
    spiedUtilisateurUidToFind = null
  })

  it('étant donné une gouvernance existante, quand une note de contexte est créée par le gestionnaire de cette gouvernance, alors elle est ajoutée à une gourvernance', async () => {
    // GIVEN
    const ajouterNoteDeContexteAGouvernance = new AjouterNoteDeContexteAGouvernance(
      new GouvernanceExistanteRepositorySpy(),
      new GestionnaireRepositorySpy(),
      new Date(0)
    )

    // WHEN
    const result = await ajouterNoteDeContexteAGouvernance.execute({
      contenu,
      uidGouvernance,
      uidUtilisateur: uidUtilisateur,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateur)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate?.state).toStrictEqual(
      gouvernanceFactory({
        noteDeContexte: {
          contenu,
          dateDeModification: new Date(0),
          uidUtilisateurLAyantModifie: new UtilisateurUid(
            utilisateurFactory({ uid: { email: 'martin.tartempion@example.com', value: uidUtilisateur } }).state.uid
          ),
        },
        uid: uidGouvernance,
      }).state
    )
    expect(result).toBe('OK')
  })

  it('étant donné une gouvernance existante, quand une note de contexte est créée par quelqu’un d’autre que le gestionnaire de cette gouvernance, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNoteDeContexteAGouvernance = new AjouterNoteDeContexteAGouvernance(
      new GouvernanceExistanteRepositorySpy(),
      new UtilisateurUsurpateurRepositorySpy()
    )

    // WHEN
    const result = await ajouterNoteDeContexteAGouvernance.execute({ contenu, uidGouvernance, uidUtilisateur: 'utilisateurUsurpateur' })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe('utilisateurUsurpateur')
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('utilisateurNePeutPasAjouterNoteDeContexte')
  })

  it('étant donné une gouvernance inexistante, quand une note de contexte est créée, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNoteDeContexteAGouvernance = new AjouterNoteDeContexteAGouvernance(
      new GouvernanceInexistanteRepositorySpy(),
      new GestionnaireRepositorySpy()
    )

    // WHEN
    const result = await ajouterNoteDeContexteAGouvernance.execute({
      contenu,
      uidGouvernance,
      uidUtilisateur: uidUtilisateur,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateur)
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('gouvernanceInexistante')
  })

  it('étant donné un utilisateur inexistant, quand une note de contexte est créée, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNoteDeContexteAGouvernance = new AjouterNoteDeContexteAGouvernance(
      new GouvernanceInexistanteRepositorySpy(),
      new GestionnaireInexistantRepositorySpy()
    )

    // WHEN
    const result = await ajouterNoteDeContexteAGouvernance.execute({
      contenu,
      uidGouvernance,
      uidUtilisateur: uidUtilisateur,
    })

    // THEN
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateur)
    expect(spiedGouvernanceUidToFind).toBeNull()
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result).toBe('utilisateurInexistant')
  })
})

const contenu = '<p>Lorem ipsum dolor sit amet consectetur. Sagittis dui sapien libero tristique leo tortor.</p>'
const uidGouvernance = '1'
const uidUtilisateur = 'fooId'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedGouvernanceToUpdate: Gouvernance | null
let spiedUtilisateurUidToFind: string | null

class GouvernanceExistanteRepositorySpy implements FindGouvernanceRepository, UpdateGouvernanceRepository {
  async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(
      gouvernanceFactory({
        noteDeContexte: {
          contenu,
          dateDeModification: new Date(0),
          uidUtilisateurLAyantModifie: new UtilisateurUid(
            utilisateurFactory({ uid: { email: 'martin.tartempion@example.com', value: 'fooId' } }).state.uid
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

class GouvernanceInexistanteRepositorySpy extends GouvernanceExistanteRepositorySpy {
  override async find(uid: GouvernanceUid): Promise<Gouvernance | null> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(null)
  }
}

class GestionnaireRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory())
  }
}

class GestionnaireInexistantRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(null)
  }
}

class UtilisateurUsurpateurRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory({ uid: { email: 'utilisateurUsurpateur@example.com', value: 'utilisateurUsurpateur' } }))
  }
}