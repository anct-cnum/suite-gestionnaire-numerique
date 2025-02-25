/* eslint-disable import/no-restricted-paths */
import { createSessionUtilisateurPresenter, SessionUtilisateurViewModel } from './sessionUtilisateurPresenter'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('session utilisateur presenter', () => {
  it('affichage des informations de session de l’utilisateur connecté', () => {
    // GIVEN
    const utilisateurReadModel = utilisateurReadModelFactory({
      role: {
        categorie: 'mednum',
        doesItBelongToGroupeAdmin: true,
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
      email: 'martin.tartempion@example.net',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: {
        doesItBelongToGroupeAdmin: true,
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
