import { Just, Maybe, Nothing } from 'purify-ts'

import { AjouterNoteDeContexteAGouvernance } from './AjouterNoteDeContexteAGouvernance'
import { FindGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUid, UtilisateurUidState } from '@/domain/Utilisateur'

describe('ajouter une note de contexte à une gouvernance', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedGouvernanceToUpdate = null
    spiedUtilisateurUidToFind = null
  })

  it('étant donné une gouvernance existante, quand une note de contexte est créée, alors elle est ajoutée à une gourvenance', async () => {
    // GIVEN
    const ajouterNoteDeContexteAGouvernance = new AjouterNoteDeContexteAGouvernance(
      new GouvernanceExistanteRepositorySpy(),
      new UtilisateurRepositorySpy(),
      new Date(0)
    )

    // WHEN
    const result = await ajouterNoteDeContexteAGouvernance.execute({ contenu, uid: uidUtilisateur, uidGouvernance })

    // THEN
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateur)
    expect(spiedGouvernanceToUpdate?.state).toStrictEqual(
      Gouvernance.create({
        dateDeModificationNoteDeContexte: new Date(0),
        noteDeContexte: contenu,
        uid: uidGouvernance,
        uidUtilisateurAyantModifieNoteDeContexte: new UtilisateurUid(utilisateurFactory({ uid: { email: 'martin.tartempion@example.com', value: uidUtilisateur } }).state.uid),
      }).state
    )
    expect(result.extract()).toBe('Ok')
  })

  it('étant donné une gouvernance inexistante, quand une note de contexte est créée, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNoteDeContexteAGouvernance = new AjouterNoteDeContexteAGouvernance(
      new GouvernanceInexistanteRepositorySpy(),
      new UtilisateurRepositorySpy(),
      new Date(0)
    )

    // WHEN
    const result = await ajouterNoteDeContexteAGouvernance.execute({ contenu, uid: uidUtilisateur, uidGouvernance })

    // THEN
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateur)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result.extract()).toBe('gouvernanceInexistante')
  })

  it('étant donné un utilisateur inexistant, quand une note de contexte est créée, alors une erreur est renvoyée', async () => {
    // GIVEN
    const ajouterNoteDeContexteAGouvernance = new AjouterNoteDeContexteAGouvernance(
      new GouvernanceInexistanteRepositorySpy(),
      new UtilisateurInexistantRepositorySpy(),
      new Date(0)
    )

    // WHEN
    const result = await ajouterNoteDeContexteAGouvernance.execute({ contenu, uid: uidUtilisateur, uidGouvernance })

    // THEN
    expect(spiedGouvernanceUidToFind).toBeNull()
    expect(spiedUtilisateurUidToFind).toBe(uidUtilisateur)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result.extract()).toBe('utilisateurInexistant')
  })
})

const contenu = '<p>Lorem ipsum dolor sit amet consectetur. Sagittis dui sapien libero tristique leo tortor.</p>'
const uidGouvernance = '1'
const uidUtilisateur = 'fooId'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedGouvernanceToUpdate: Gouvernance | null
let spiedUtilisateurUidToFind: string | null

class GouvernanceExistanteRepositorySpy implements FindGouvernanceRepository, UpdateGouvernanceRepository {
  async find(uid: GouvernanceUid): Promise<Maybe<Gouvernance>> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(
      Just(Gouvernance.create({
        dateDeModificationNoteDeContexte: new Date(0),
        noteDeContexte: contenu,
        uid: uidGouvernance,
        uidUtilisateurAyantModifieNoteDeContexte: new UtilisateurUid(utilisateurFactory({ uid: { email: 'martin.tartempion@example.com', value: 'fooId' } }).state.uid),
      }))
    )
  }

  async update(gouvernance: Gouvernance): Promise<void> {
    spiedGouvernanceToUpdate = gouvernance
    return Promise.resolve()
  }
}

class GouvernanceInexistanteRepositorySpy extends GouvernanceExistanteRepositorySpy {
  override async find(uid: GouvernanceUid): Promise<Maybe<Gouvernance>> {
    spiedGouvernanceUidToFind = uid
    return Promise.resolve(Nothing)
  }
}

class UtilisateurRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(utilisateurFactory())
  }
}

class UtilisateurInexistantRepositorySpy implements FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUtilisateurUidToFind = uid
    return Promise.resolve(null)
  }
}
