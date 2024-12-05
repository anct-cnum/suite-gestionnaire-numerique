import { Gouvernance, GouvernanceState, NoteDeContexte } from './Gouvernance'
import { utilisateurFactory } from './testHelper'
import { UtilisateurUid } from './Utilisateur'

describe('gouvernance', () => {
  it('une note de contexte peut être ajouter à une gouvernance', () => {
    // GIVEN
    const utilisateurUid = { email: 'martin.tartempion@example.com', value: 'fooUserId' }
    const gouvernance = Gouvernance.create({ uid: 'fooGouvernanceId', utilisateurUid })
    const noteDeContexte = new NoteDeContexte(
      new Date(0),
      new UtilisateurUid(utilisateurFactory({ uid: utilisateurUid }).state.uid),
      '<p>example</p>'
    )

    // WHEN
    gouvernance.ajouterNoteDeContexte(noteDeContexte)

    // THEN
    expect(gouvernance.state).toStrictEqual<GouvernanceState>({
      noteDeContexte: {
        dateDeModification: '1970-01-01T00:00:00.000Z',
        uidUtilisateurAyantModifie: 'fooUserId',
        value: '<p>example</p>',
      },
      uid: {
        value: 'fooGouvernanceId',
      },
      utilisateurUid: {
        email: 'martin.tartempion@example.com',
        value: 'fooUserId',
      },
    })
  })
})
