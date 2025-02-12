// Stryker disable all
import { GouvernanceViewModel } from './gouvernancePresenter'
import { formatMontant, MesFeuillesDeRouteViewModel } from './mesFeuillesDeRoutePresenter'
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

export function gouvernanceViewModelFactory(
  override?: Partial<GouvernanceViewModel>
): GouvernanceViewModel {
  return {
    comiteARemplir: {
      commentaire: '',
      date: '',
      derniereEdition: '',
      editeur: '',
      frequences: [],
      types: [],
      uid: 1,
    },
    dateAujourdhui: '',
    departement: '',
    hasMembres: false,
    isVide: false,
    sectionFeuillesDeRoute: {
      budgetTotalCumule: '',
      feuillesDeRoute: [],
      lien: {
        label: '',
        url: '',
      },
      total: '0',
      wording: '',
    },
    sectionMembres: {
      coporteurs: [],

      totalEtWording: [0, ''],
      wordingRecap: '',
    },
    sectionNoteDeContexte: {
      noteDeContexte: {
        dateDeModification: '',
        nomAuteur: '',
        prenomAuteur: '',
        texteAvecHTML: '',
      },
      sousTitre: '',
    },
    uid: '',
    ...override,
  }
}

export function mesFeuillesDeRouteViewModelFactory(
  override?: Partial<MesFeuillesDeRouteViewModel>
): MesFeuillesDeRouteViewModel {
  return {
    feuillesDeRoute: [
      {
        actions: [
          {
            nom: 'Structurer une filière de reconditionnement locale 1',
            porteur: 'CC des Monts du Lyonnais',
            statut: {
              icon: 'fr-icon-flashlight-line',
              iconStyle: 'pin-action-acceptee',
              libelle: 'Subvention acceptée',
              variant: 'new',
            },
            totaux: {
              coFinancement: formatMontant(30_000),
              financementAccorde: formatMontant(40_000),
            },
            uid: 'actionFooId1',
          },
          {
            nom: 'Structurer une filière de reconditionnement locale 2',
            porteur: 'CC des Monts du Lyonnais',
            statut: {
              icon: 'fr-icon-flashlight-line',
              iconStyle: 'pin-action-acceptee',
              libelle: 'Subvention acceptée',
              variant: 'new',
            },
            totaux: {
              coFinancement: formatMontant(50_000),
              financementAccorde: formatMontant(20_000),
            },
            uid: 'actionFooId2',
          },
        ],
        beneficiaires: '5 bénéficiaires',
        coFinanceurs: '3 co-financeurs',
        nom: 'Feuille de route 1',
        nombreDActionsAttachees: '2 actions attachées à cette feuille de route',
        pieceJointe: undefined,
        porteur: 'CC des Monts du Lyonnais',
        totaux: {
          budget: '0 €',
          coFinancement: '0 €',
          financementAccorde: '0 €',
        },
        uid: 'feuilleDeRouteFooId1',
        wordingDetailDuBudget: 'dont 0 € de co-financements et 0 € des financements accordés',
      },
      {
        actions: [
          {
            nom: 'Ressource humaine 1',
            porteur: 'CC des Monts du Lyonnais',
            statut: {
              icon: 'fr-icon-flashlight-line',
              iconStyle: 'pin-action-acceptee',
              libelle: 'Subvention acceptée',
              variant: 'new',
            },
            totaux: {
              coFinancement: formatMontant(60_000),
              financementAccorde: formatMontant(20_000),
            },
            uid: 'actionFooId1',
          },
          {
            nom: 'Ressource humaine 2',
            porteur: 'CC des Monts du Lyonnais',
            statut: {
              icon: 'fr-icon-flashlight-line',
              iconStyle: 'pin-action-acceptee',
              libelle: 'Subvention acceptée',
              variant: 'new',
            },
            totaux: {
              coFinancement: formatMontant(40_000),
              financementAccorde: formatMontant(30_000),
            },
            uid: 'actionFooId2',
          },
        ],
        beneficiaires: '5 bénéficiaires',
        coFinanceurs: '3 co-financeurs',
        nom: 'Feuille de route 2',
        nombreDActionsAttachees: '2 actions attachées à cette feuille de route',
        pieceJointe: undefined,
        porteur: 'CC des Monts du Lyonnais',
        totaux: {
          budget: '0 €',
          coFinancement: '0 €',
          financementAccorde: '0 €',
        },
        uid: 'feuilleDeRouteFooId2',
        wordingDetailDuBudget: 'dont 0 € de co-financements et 0 € des financements accordés',
      },
    ],
    titre: 'Feuilles de route · 93',
    totaux: {
      budget: '0 €',
      coFinancement: '0 €',
      financementAccorde: '0 €',
    },
    ...override,
  }
}
