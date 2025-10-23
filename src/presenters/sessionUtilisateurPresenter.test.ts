import { createSessionUtilisateurPresenter, SessionUtilisateurViewModel } from './sessionUtilisateurPresenter'
import { TerritoireReadModel } from '@/use-cases/queries/RecupererTerritoireUtilisateur'
import { RoleUtilisateur } from '@/use-cases/queries/shared/UnUtilisateurReadModel'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('session utilisateur presenter', () => {
  it('affichage des informations de session de l\'utilisateur connecté avec un territoire', () => {
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

    const territoire: TerritoireReadModel = {
      codes: ['75'],
      type: 'departement',
    }

    // WHEN
    const sessionUtilisateurViewModel = createSessionUtilisateurPresenter(
      utilisateurReadModel,
      territoire
    )

    // THEN
    expect(sessionUtilisateurViewModel).toStrictEqual<SessionUtilisateurViewModel>({
      codeDepartement: '75',
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
      territoire: {
        codes: ['75'],
        type: 'departement',
      },
      uid: 'fooId',
    })
  })

  it('affichage des informations de session de l\'utilisateur connecté sans territoire', () => {
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

    const territoire: TerritoireReadModel = {
      codes: [],
      type: 'departement',
    }

    // WHEN
    const sessionUtilisateurViewModel = createSessionUtilisateurPresenter(
      utilisateurReadModel,
      territoire
    )

    // THEN
    expect(sessionUtilisateurViewModel).toStrictEqual<SessionUtilisateurViewModel>({
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
      territoire: {
        codes: [],
        type: 'departement',
      },
      uid: 'fooId',
    })
  })
})
