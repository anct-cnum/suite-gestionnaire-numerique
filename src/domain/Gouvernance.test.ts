import { Gouvernance, NoteDeContexte } from './Gouvernance'
import { utilisateurFactory } from './testHelper'
import { UtilisateurUid } from './Utilisateur'

describe('gouvernance', () => {
  it('je peux ajouter une note de contexte', () => {
    // GIVEN
    const gouvernance = Gouvernance.create({ uid: 'fooGouvernanceId' })
    const noteDeContexte = new NoteDeContexte(
      new Date(0),
      new UtilisateurUid(utilisateurFactory({ uid: { email: 'martin.tartempion@example.com', value: 'fooUserId' } }).state.uid),
      '<p>example</p>'
    )

    // WHEN
    gouvernance.ajouterNoteDeContexte(noteDeContexte)

    // THEN
    expect(gouvernance.state).toStrictEqual({
      noteDeContexte: {
        dateDeModification: '1970-01-01T00:00:00.000Z',
        uidUtilisateurAyantModifie: 'fooUserId',
        value: '<p>example</p>',
      },
      uid: {
        value: 'fooGouvernanceId',
      },
    })
  })
})
