// Stryker disable all
import { GouvernanceViewModel } from './gouvernancePresenter'
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

export function sectionFeuillesDeRouteFactory(override?: Partial<GouvernanceViewModel['sectionFeuillesDeRoute']>): GouvernanceViewModel['sectionFeuillesDeRoute'] {
  return {
    autorisations: {
      accesMembreConfirme: true,
      ajouterUnMembre: true,
      supprimerUnMembre: true,
    },
    membres: [
      {
        contactReferent: 'Laetitia Henrich',
        nom: 'Préfecture du Rhône',
        roles: ['Co-porteur'],
        suppressionDuMembreAutorise: false,
        typologie: 'Préfecture départementale',
      },
      {
        contactReferent: 'Durant Didier',
        nom: 'Département du Rhône',
        roles: ['Co-porteur', 'Co-financeur'],
        suppressionDuMembreAutorise: false,
        typologie: 'Collectivité, EPCI',
      },
      {
        contactReferent: 'Tom Dupont',
        nom: 'Département du Rhône',
        roles: [],
        suppressionDuMembreAutorise: false,
        typologie: 'Collectivité, EPCI',
      },
    ],
    roles: ['Co-porteur', 'Co-financeur'],
    titre: 'Gérer les membres · Rhône',
    typologies: ['Préfecture départementale', 'Collectivité, EPCI'],
    ...override,
  } as const
}

export function sectionMembresFactory(override?: Partial<GouvernanceViewModel['sectionMembres']>): GouvernanceViewModel['sectionMembres'] {
  return {
    detailDuNombreDeChaqueMembre: '',
    membres: [],
    total: '0',
    wording: '',
    ...override,
  } as const
}

export function gouvernanceViewModelFactory(override?: Partial<GouvernanceViewModel>): GouvernanceViewModel {
  return {
    sectionFeuillesDeRoute: sectionFeuillesDeRouteFactory(),
    sectionMembres: sectionMembresFactory(),
    ...override,
  } as GouvernanceViewModel
}
