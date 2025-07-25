import { createSessionUtilisateurPresenter, SessionUtilisateurViewModel } from './sessionUtilisateurPresenter'
import { RoleUtilisateur } from '@/use-cases/queries/shared/UnUtilisateurReadModel'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('session utilisateur presenter', () => {
  it('affichage des informations de session de l’utilisateur connecté', () => {
    // GIVEN
    const utilisateurReadModel = utilisateurReadModelFactory({
      role: {
        categorie: 'mednum',
        doesItBelongToGroupeAdmin: true,
        nom: 'Gestionnaire structure',
        organisation: 'Mednum',
        rolesGerables: [],
        type: 'gestionnaire_structure' as RoleUtilisateur,
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
      peutChangerDeRole: false,
      prenom: 'Martin',
      role: {
        doesItBelongToGroupeAdmin: true,
        libelle: 'Mednum',
        nom: 'Gestionnaire structure',
        pictogramme: 'mednum',
        rolesGerables: [],
        type: 'gestionnaire_structure',
      },
      telephone: '0102030405',
      uid: 'fooId',
    })
  })
})
