import { Just, Maybe, Nothing } from 'purify-ts'

import { AjouterNoteDeContexteAGouvernance } from './AjouterNoteDeContexteAGouvernance'
import { FindGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { Gouvernance, GouvernanceUid } from '@/domain/Gouvernance'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUid } from '@/domain/Utilisateur'

describe('ajouter une note de contexte à une gouvernance', () => {
  beforeEach(() => {
    spiedGouvernanceUidToFind = null
    spiedGouvernanceToUpdate = null
  })

  it('étant donné une gouvernance existante, quand une note de contexte est créée, alors elle est ajoutée à une gourvenance', async () => {
    // GIVEN
    const uidUtilisateur = 'fooId'
    const ajouterNoteDeContexteAGouvernance = new AjouterNoteDeContexteAGouvernance(
      new GouvernanceExistanteRepositorySpy(),
      new UtilisateurRepositoryStub(),
      new Date(0)
    )

    // WHEN
    const result = await ajouterNoteDeContexteAGouvernance.execute({ contenu, uid: uidUtilisateur, uidGouvernance })

    // THEN
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
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
      new GouvernanceInexistanteRepositorySpy()
    )

    // WHEN
    const result = await ajouterNoteDeContexteAGouvernance.execute({ contenu, uidGouvernance })

    // THEN
    expect(spiedGouvernanceUidToFind?.state).toStrictEqual(new GouvernanceUid(uidGouvernance).state)
    expect(spiedGouvernanceToUpdate).toBeNull()
    expect(result.extract()).toBe('gouvernanceInexistante')
  })
})

const contenu = '<p>Lorem ipsum dolor sit amet consectetur. Sagittis dui sapien libero tristique leo tortor.</p>'
const uidGouvernance = '1'
let spiedGouvernanceUidToFind: GouvernanceUid | null
let spiedGouvernanceToUpdate: Gouvernance | null

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

class UtilisateurRepositoryStub implements FindUtilisateurRepository {
  async find(): Promise<Utilisateur | null> {
    return Promise.resolve(utilisateurFactory())
  }
}
