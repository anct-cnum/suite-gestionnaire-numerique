// Stryker disable all
import { MesMembresViewModel } from './mesMembresPresenter'
import { SessionUtilisateurViewModel } from './sessionUtilisateurPresenter'

export function sessionUtilisateurViewModelFactory(
  override?: Partial<SessionUtilisateurViewModel>
): SessionUtilisateurViewModel {
  return {
    codeDepartement: '93',
    displayLiensGouvernance: false,
    email: 'martin.tartempion@example.net',
    nom: 'Tartempion',
    prenom: 'Martin',
    role: {
      doesItBelongToGroupeAdmin: true,
      libelle: 'Mednum',
      nom: 'Support animation',
      pictogramme: 'support-animation',
      rolesGerables: [] as ReadonlyArray<string>,
    },
    telephone: '0102030405',
    uid: 'fooId',
    ...override,
  }
}

export function mesMembresViewModelFactory(
  override?: Partial<MesMembresViewModel>
): MesMembresViewModel {
  return {
    autorisations: {
      accesMembreConfirme: true,
      ajouterUnMembre: true,
      supprimerUnMembre: true,
    },
    candidatsOuSuggeres: [
      {
        adresse: '172 B RTE DE LENS 62223 SAINTE-CATHERINE',
        contactReferent: 'Eric Dupont, Directeur didier.dupont@example.com',
        nom: 'Croix Rouge Française',
        siret: '79227291600034',
        statut: 'Suggéré',
        typologie: 'Association',
        uidMembre: 'structure-79227291600034',
      },
      {
        adresse: '17 avenue de l’opéra 75000 Paris',
        contactReferent: 'Eric Durant, Directeur eric.durant@example.com',
        nom: 'La Poste',
        siret: '99229991601034',
        statut: 'Candidat',
        typologie: 'EPCI',
        uidMembre: 'structure-99229991601034',
      },
    ],
    membres: [
      {
        contactReferent: 'Laetitia Henrich',
        nom: 'Préfecture du Rhône',
        roles: ['Co-porteur'],
        suppressionDuMembreAutorise: false,
        typologie: 'Préfecture départementale',
        uidMembre: 'sgar-69',
      },
      {
        contactReferent: 'Durant Didier',
        nom: 'Département du Rhône',
        roles: ['Co-porteur', 'Co-financeur'],
        suppressionDuMembreAutorise: false,
        typologie: 'Collectivité, EPCI',
        uidMembre: 'departement-69',
      },
      {
        contactReferent: 'Tom Dupont',
        nom: 'Département du Rhône',
        roles: [],
        suppressionDuMembreAutorise: false,
        typologie: 'Collectivité, EPCI',
        uidMembre: 'departement-69',
      },
    ],
    roles: ['Co-porteur', 'Co-financeur'],
    titre: 'Gérer les membres · Rhône',
    typologies: ['Préfecture départementale', 'Collectivité, EPCI'],
    uidGouvernance: 'gouvernanceFooId',
    ...override,
  }
}
