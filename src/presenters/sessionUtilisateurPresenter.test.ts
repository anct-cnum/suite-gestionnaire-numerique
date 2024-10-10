import { createSessionUtilisateurPresenter } from './sessionUtilisateurPresenter'

describe('session utilisateur presenter', () => {
  it('affichage des informations de session de l’utilisateur connecté', () => {
    // GIVEN
    const utilisateurReadModel = {
      departementCode: null,
      derniereConnexion: new Date(0),
      email: 'martin.tartempion@example.net',
      groupementId: null,
      inviteLe: new Date(0),
      isActive: true,
      isSuperAdmin: false,
      nom: 'Tartempion',
      prenom: 'Martin',
      regionCode: null,
      role: {
        categorie: 'mednum',
        groupe: 'admin',
        nom: 'Support animation',
        territoireOuStructure: 'Mednum',
      },
      structureId: null,
      telephone: '0102030405',
      uid: 'fooId',
    }

    // WHEN
    const sessionUtilisateurViewModel = createSessionUtilisateurPresenter(utilisateurReadModel)

    // THEN
    const expectedSessionUtilisateurViewModel = {
      email: 'martin.tartempion@example.net',
      isSuperAdmin: false,
      nom: 'Tartempion',
      prenom: 'Martin',
      role: {
        groupe: 'admin',
        libelle: 'Mednum',
        nom: 'Support animation',
        pictogramme: 'mednum',
      },
      telephone: '0102030405',
      uid: 'fooId',
    }
    expect(sessionUtilisateurViewModel).toStrictEqual(expectedSessionUtilisateurViewModel)
  })
})
