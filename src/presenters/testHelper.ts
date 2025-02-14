// Stryker disable all
import { ActionViewModel } from './actionPresenter'
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
      lien: '',
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

export function actionViewModelFactory(overrides: Partial<ActionViewModel> = {}): ActionViewModel {
  return {
    anneeDeDebut: '2025',
    anneeDeFin: '2026',
    beneficiaires: [
      {
        nom: 'Croix Rouge Française',
        url: '/',
      },
      {
        nom: 'La Poste',
        url: '/',
      },
    ],
    besoins: ['Établir un diagnostic territorial', 'Appui juridique dédié à la gouvernance'],
    budgetGlobal: 50000,
    budgetPrevisionnel: [
      {
        coFinanceur: 'Budget prévisionnel 2024',
        montant: '20 000 €',
      },
      {
        coFinanceur: 'Subvention de prestation',
        montant: '10 000 €',
      },
      {
        coFinanceur: 'CC des Monts du Lyonnais',
        montant: '5 000 €',
      },
      {
        coFinanceur: 'Croix Rouge Française',
        montant: '5 000 €',
      },
    ],
    contexte: '<p>Contexte de l‘action</p>',
    description: '<p><strong>Description de l‘action.</strong></p>',
    lienPourModifier: '/gouvernance/11/feuille-de-route/116/action/actionFooId1/modifier',
    nom: 'Structurer une filière de reconditionnement locale 1',
    porteur: 'CC des Monts du Lyonnais',
    statut: {
      background: 'pink',
      icon: 'fr-icon-flashlight-line',
      iconStyle: 'pin-action--deposee',
      libelle: 'Demande déposée',
      variant: 'new',
    },
    temporalite: 'pluriannuelle',
    totaux: {
      coFinancement: '30 000 €',
      financementAccorde: '40 000 €',
    },
    uid: 'actionFooId1',
    ...overrides,
  }
}

export function actionVideViewModelFactory(overrides: Partial<ActionViewModel> = {}): ActionViewModel {
  return {
    anneeDeDebut: '2025',
    beneficiaires: [],
    besoins: ['Établir un diagnostic territorial'],
    budgetGlobal: 0,
    budgetPrevisionnel: [],
    contexte: '',
    description: '',
    lienPourModifier: '/gouvernance/11/feuille-de-route/116/action/actionFooId1/modifier',
    nom: '',
    porteur: 'CC des Monts du Lyonnais',
    statut: {
      background: 'pink',
      icon: 'fr-icon-flashlight-line',
      iconStyle: 'pin-action--deposee',
      libelle: 'Demande déposée',
      variant: 'new',
    },
    temporalite: 'annuelle',
    totaux: {
      coFinancement: '0 €',
      financementAccorde: '0 €',
    },
    uid: 'actionFooId1',
    ...overrides,
  }
}
