/* eslint-disable import/no-restricted-paths */
// Stryker disable all
import { ActionViewModel } from './actionPresenter'
import { GouvernanceViewModel } from './gouvernancePresenter'
import { SessionUtilisateurViewModel } from './sessionUtilisateurPresenter'

const enveloppes: ActionViewModel['enveloppes'] = [
  {
    budget: 50_000,
    isSelected: false,
    label: 'Conseiller Numérique - 2024',
    value: '1',
  },
  {
    budget: 100_000,
    isSelected: false,
    label: 'Conseiller Numérique - Plan France Relance',
    value: '2',
  },
  {
    budget: 30_000,
    isSelected: false,
    label: 'Formation Aidant Numérique/Aidants Connect - 2024',
    value: '3',
  },
  {
    budget: 10_000,
    isSelected: false,
    label: 'Ingénierie France Numérique Ensemble - 2024',
    value: '4',
  },
]

export function sessionUtilisateurViewModelFactory(
  override?: Partial<SessionUtilisateurViewModel>
): SessionUtilisateurViewModel {
  return {
    codeDepartement: '93',
    displayLiensGouvernance: false,
    email: 'martin.tartempion@example.net',
    nom: 'Tartempion',
    peutChangerDeRole: true,
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
    links: {
      membres: '/',
    },
    peutVoirNotePrivee: true,
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
    uid: 'gouvernanceFooId',
    ...override,
  }
}

export function actionViewModelFactory(overrides: Partial<ActionViewModel> = {}): ActionViewModel {
  return {
    anneeDeDebut: '2025',
    anneeDeFin: '2026',
    beneficiaires: [
      {
        color: 'info',
        isSelected: true,
        label: 'Rhône (69)',
        statut: 'Co-porteur',
        value: 'membreFooId3',
      },
      {
        color: 'info',
        isSelected: false,
        label: 'CC des Monts du Lyonnais',
        statut: 'Co-porteur',
        value: 'membreFooId4',
      },
    ],
    besoins: {
      financements: [
        {
          isSelected: false,
          label: 'Structurer un fond local pour l’inclusion numérique',
          value: 'structurer_fond_local',
        },
        {
          isSelected: true,
          label: 'Monter des dossiers de subvention complexes',
          value: 'monter_dossier_subvention',
        },
        {
          isSelected: false,
          label: 'Animer et mettre en œuvre la gouvernance et la feuille de route',
          value: 'animer_et_mettre_en_oeuvre_gouvernance',
        },
      ],
      formations: [
        {
          isSelected: false,
          label: 'Établir un diagnostic territorial',
          value: 'etablir_diagnostic_territorial',
        },
        {
          isSelected: true,
          label: 'Co-construire la feuille de route avec les membres',
          value: 'coconstruire_feuille_avec_membres',
        },
        {
          isSelected: false,
          label: 'Rédiger la feuille de route',
          value: 'rediger_feuille',
        },
        {
          isSelected: false,
          label: 'Appui juridique dédié à la gouvernance',
          value: 'appui_juridique_dedie_gouvernance',
        },
      ],
      formationsProfessionnels: [
        {
          isSelected: false,
          label: 'Appuyer la certification Qualiopi de structures privées portant des formations à l’inclusion numérique',
          value: 'appuyer_certification_qualiopi',
        },
      ],
      outillages: [
        {
          isSelected: false,
          label: 'Structurer une filière de reconditionnement locale',
          value: 'structurer_filiere_reconditionnement_locale',
        },
        {
          isSelected: false,
          label: 'Collecter des données territoriales pour alimenter un hub national',
          value: 'collecter_donnees_territoriales',
        },
        {
          isSelected: false,
          label: 'Sensibiliser les acteur de l’inclusion numérique aux outils existants',
          value: 'sensibiliser_acteurs',
        },
      ],
    },
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
    enveloppes,
    hasBesoins: true,
    lienPourModifier: '/gouvernance/11/feuille-de-route/116/action/actionFooId1/modifier',
    nom: 'Structurer une filière de reconditionnement locale 1',
    nomFeuilleDeRoute: 'Feuille de route 69',
    porteurs: [
      {
        color: 'info',
        isSelected: false,
        label: 'Rhône (69)',
        statut: 'Co-porteur',
        value: 'membreFooId1',
      },
      {
        color: 'info',
        isSelected: true,
        label: 'CC des Monts du Lyonnais',
        statut: 'Co-porteur',
        value: 'membreFooId2',
      },
    ],
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
    urlFeuilleDeRoute: '/gouvernance/11/feuille-de-route/116',
    urlGouvernance: '/gouvernance/11',
    ...overrides,
  }
}

export function actionVideViewModelFactory(overrides: Partial<ActionViewModel> = {}): ActionViewModel {
  return {
    anneeDeDebut: '2025',
    beneficiaires: [],
    besoins: {
      financements: [],
      formations: [
        {
          isSelected: true,
          label: 'Établir un diagnostic territorial',
          value: 'etablir_diagnostic_territorial',
        },
      ],
      formationsProfessionnels: [{
        isSelected: false,
        label: 'Appuyer la certification Qualiopi de structures privées portant des formations à l’inclusion numérique',
        value: 'appuyer_certification_qualiopi',
      }],
      outillages: [
        {
          isSelected: false,
          label: 'Structurer une filière de reconditionnement locale',
          value: 'structurer_filiere_reconditionnement_locale',
        },
      ],
    },
    budgetGlobal: 0,
    budgetPrevisionnel: [],
    contexte: '',
    description: '',
    enveloppes,
    hasBesoins: false,
    lienPourModifier: '/gouvernance/11/feuille-de-route/116/action/actionFooId1/modifier',
    nom: '',
    nomFeuilleDeRoute: 'Feuille de route 69',
    porteurs: [],
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
    urlFeuilleDeRoute: '/gouvernance/11/feuille-de-route/116',
    urlGouvernance: '/gouvernance/11',
    ...overrides,
  }
}
