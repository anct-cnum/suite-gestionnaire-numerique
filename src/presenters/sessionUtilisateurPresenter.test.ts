import { createSessionUtilisateurPresenter, SessionUtilisateurViewModel } from './sessionUtilisateurPresenter'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('session utilisateur presenter', () => {
  it('affichage des informations de session de l’utilisateur connecté', () => {
    // GIVEN
    const utilisateurReadModel = utilisateurReadModelFactory({
      role: {
        categorie: 'mednum',
        groupe: 'admin',
        nom: 'Support animation',
        organisation: 'Mednum',
        rolesGerables: [],
      },
      uid: 'fooId',
    })

    // WHEN
    const sessionUtilisateurSansEtablissementViewModel = createSessionUtilisateurPresenter(
      utilisateurReadModel
    )

    // THEN
    expect(sessionUtilisateurSansEtablissementViewModel).toStrictEqual<SessionUtilisateurViewModel>({
      codeDepartement: null,
      displayLiensGouvernance: false,
      emailDeContact: 'martin.tartempion@example.net',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: {
        groupe: 'admin',
        libelle: 'Mednum',
        nom: 'Support animation',
        pictogramme: 'mednum',
        rolesGerables: [],
      },
      telephone: '0102030405',
      uid: 'fooId',
    })
  })
})
