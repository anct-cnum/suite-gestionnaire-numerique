/* eslint-disable import/no-restricted-paths */
// Stryker disable all
import { ActionViewModel } from './actionPresenter'
import { FeuilleDeRouteViewModel } from './feuilleDeRoutePresenter'
import { GouvernanceViewModel } from './gouvernancePresenter'
import { SessionUtilisateurViewModel } from './sessionUtilisateurPresenter'
import { actionStatutViewModelByStatut } from './shared/action'
import { formatMontant } from './shared/number'
import { BesoinsPossible } from '@/use-cases/queries/shared/ActionReadModel'

const enveloppes: ActionViewModel['enveloppes'] = [
  {
    available: true,
    budget: 50_000,
    isSelected: false,
    label: 'Conseiller Numérique - 2024',
    limiteLaDemandeSubvention: true,
    value: '1',
  },
  {
    available: true,
    budget: 100_000,
    isSelected: false,
    label: 'Conseiller Numérique - Plan France Relance',
    limiteLaDemandeSubvention: true,
    value: '2',
  },
  {
    available: true,
    budget: 30_000,
    isSelected: false,
    label: 'Formation Aidant Numérique/Aidants Connect - 2024',
    limiteLaDemandeSubvention: true,
    value: '3',
  },
  {
    available: true,
    budget: 10_000,
    isSelected: false,
    label: 'Ingénierie France Numérique Ensemble - 2024',
    limiteLaDemandeSubvention: true,
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
      nom: 'Gestionnaire structure',
      pictogramme: 'support-animation',
      rolesGerables: [] as ReadonlyArray<string>,
      type: 'gestionnaire_structure',
    },
    telephone: '0102030405',
    territoire: {
      codes: ['93'],
      type: 'departement',
    },
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
    peutGererGouvernance: true,
    peutVoirNotePrivee: true,
    porteursPotentielsNouvellesFeuillesDeRouteOuActions: [],
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
    besoins: {
      financements: [
        {
          isSelected: false,
          label: 'Structurer un fond local pour l’inclusion numérique',
          value: BesoinsPossible.STRUCTURER_UN_FONDS,
        },
        {
          isSelected: true,
          label: 'Monter des dossiers de subvention complexes',
          value: BesoinsPossible.MONTER_DOSSIERS_DE_SUBVENSION,
        },
        {
          isSelected: false,
          label: 'Animer et mettre en œuvre la gouvernance et la feuille de route',
          value: BesoinsPossible.ANIMER_LA_GOUVERNANCE,
        },
      ],
      formations: [
        {
          isSelected: false,
          label: 'Établir un diagnostic territorial',
          value: BesoinsPossible.ETABLIR_UN_DIAGNOSTIC_TERRITORIAL,
        },
        {
          isSelected: true,
          label: 'Co-construire la feuille de route avec les membres',
          value: BesoinsPossible.CO_CONSTRUIRE_LA_FEUILLE_DE_ROUTE,
        },
        {
          isSelected: false,
          label: 'Rédiger la feuille de route',
          value: BesoinsPossible.REDIGER_LA_FEUILLE_DE_ROUTE,
        },
        {
          isSelected: false,
          label: 'Appui juridique dédié à la gouvernance',
          value: BesoinsPossible.APPUI_JURIDIQUE,
        },
      ],
      formationsProfessionnels: [
        {
          isSelected: false,
          label: 'Appuyer la certification Qualiopi de structures privées portant des formations à l’inclusion numérique',
          value: BesoinsPossible.APPUYER_LA_CERTIFICATION_QUALIOPI,
        },
      ],
      outillages: [
        {
          isSelected: false,
          label: 'Structurer une filière de reconditionnement locale',
          value: BesoinsPossible.STRUCTURER_UNE_FILIERE_DE_RECONDITIONNEMENT,
        },
        {
          isSelected: false,
          label: 'Collecter des données territoriales pour alimenter un hub national',
          value: BesoinsPossible.COLLECTER_DES_DONNEES_TERRITORIALES,
        },
        {
          isSelected: false,
          label: 'Sensibiliser les acteur de l’inclusion numérique aux outils existants',
          value: BesoinsPossible.SENSIBILISER_LES_ACTEURS_AUX_OUTILS_EXISTANTS,
        },
      ],
    },
    budgetGlobal: 50000,
    cofinancements: [
      {
        coFinanceur: 'Cofinanceur 1',
        montant: '20000',
      },
      {
        coFinanceur: 'Cofinanceur 2',
        montant: '10000',
      },
      {
        coFinanceur: 'Cofinanceur 3',
        montant: '5000',
      },
      {
        coFinanceur: 'Cofinanceur 4',
        montant: '5000',
      },
    ],
    contexte: '<p>Contexte de l‘action</p>',

    description: '<p><strong>Description de l‘action.</strong></p>',
    destinataires: [],
    enveloppes,
    lienPourModifier: '/gouvernance/11/feuille-de-route/116/action/actionFooId1/modifier',
    nom: 'Structurer une filière de reconditionnement locale 1',
    nomFeuilleDeRoute: 'Feuille de route 69',
    porteurs: [

    ],
    statut: {
      background: 'pink',
      display: true,
      icon: 'fr-icon-flashlight-line',
      libelle: 'Demande envoyée',
      variant: 'new',
    },
    temporalite: 'pluriannuelle',
    totaux: {
      coFinancement: '30000',
      financementAccorde: '40000',
    },
    uid: 'actionFooId1',
    urlFeuilleDeRoute: '/gouvernance/11/feuille-de-route/116',
    urlGestionMembresGouvernance: '/gouvernance/11',
    ...overrides,
  }
}

export function actionVideViewModelFactory(overrides: Partial<ActionViewModel> = {}): ActionViewModel {
  return {
    anneeDeDebut: '2025',
    besoins: {
      financements: [
        {
          isSelected: false,
          label: 'Structurer un fond local pour l’inclusion numérique',
          value: BesoinsPossible.STRUCTURER_UN_FONDS,
        },
        {
          isSelected: false,
          label: 'Monter des dossiers de subvention complexes',
          value: BesoinsPossible.MONTER_DOSSIERS_DE_SUBVENSION,
        },
      ],
      formations: [
        {
          isSelected: false,
          label: 'Établir un diagnostic territorial',
          value: BesoinsPossible.ETABLIR_UN_DIAGNOSTIC_TERRITORIAL,
        },
      ],
      formationsProfessionnels: [{
        isSelected: false,
        label: 'Appuyer la certification Qualiopi de structures privées portant des formations à l’inclusion numérique',
        value: BesoinsPossible.APPUYER_LA_CERTIFICATION_QUALIOPI,
      }],
      outillages: [
        {
          isSelected: false,
          label: 'Structurer une filière de reconditionnement locale',
          value: BesoinsPossible.STRUCTURER_UNE_FILIERE_DE_RECONDITIONNEMENT,
        },
      ],
    },
    budgetGlobal: 0,
    cofinancements: [],
    contexte: '',
    description: '',
    destinataires: [],
    enveloppes,
    lienPourModifier: '/gouvernance/11/feuille-de-route/116/action/actionFooId1/modifier',
    nom: '',
    nomFeuilleDeRoute: 'Feuille de route 69',
    porteurs: [],
    statut: {
      background: 'pink',
      display: true,
      icon: 'fr-icon-flashlight-line',
      libelle: 'Demande envoyée',
      variant: 'new',
    },
    temporalite: 'annuelle',
    totaux: {
      coFinancement: '0',
      financementAccorde: '0',
    },
    uid: 'actionFooId1',
    urlFeuilleDeRoute: '/gouvernance/11/feuille-de-route/116',
    urlGestionMembresGouvernance: '/gouvernance/11',
    ...overrides,
  }
}

// istanbul ignore next @preserve
export function feuilleDeRouteViewModelFactory(
  codeDepartement = '11',
  uidFeuilleDeRoute = '116',
  override?: Partial<FeuilleDeRouteViewModel>
): FeuilleDeRouteViewModel {
  return {
    action: '2 actions pour cette feuille de route',
    actions: [
      {
        besoins: 'Établir un diagnostic territorial, 2 bénéficiaires',
        budgetPrevisionnel: {
          coFinancement: formatMontant(80_000),
          coFinanceur: '2 co-financeurs',
          enveloppe: 'Enveloppe test',
          montant: formatMontant(20_000),
          total: formatMontant(100_000),
        },
        icone: actionStatutViewModelByStatut.enCours,
        modifiable: false,
        nom: 'Structurer une filière de reconditionnement locale',
        porteurs: [{
          label: 'CC des Monts du Lyonnais',
          link: `/gouvernance/${codeDepartement}/membre/membreFooId`,
        }],
        statut: actionStatutViewModelByStatut.acceptee,
        supprimable: false,
        uid: 'actionFooId1',
        urlModifier: `/gouvernance/${codeDepartement}/feuille-de-route/${uidFeuilleDeRoute}/action/actionFooId1/modifier`,
        urlVisualiser: `/gouvernance/${codeDepartement}/feuille-de-route/${uidFeuilleDeRoute}/action/actionFooId1/visualiser`,
      },
      {
        besoins: 'Établir un diagnostic territorial, 2 bénéficiaires',
        budgetPrevisionnel: {
          coFinancement: formatMontant(0),
          coFinanceur: '2 co-financeurs',
          enveloppe: 'Enveloppe test',
          montant: formatMontant(20_000),
          total: formatMontant(20_000),
        },
        icone: actionStatutViewModelByStatut.enCours,
        modifiable: false,
        nom: 'Formation Aidants Connect',
        porteurs: [{
          label: 'CC des Monts du Lyonnais',
          link: `/gouvernance/${codeDepartement}/membre/membreFooId`,
        }],
        statut: actionStatutViewModelByStatut.refusee,
        supprimable: false,
        uid: 'actionFooId2',
        urlModifier: `/gouvernance/${codeDepartement}/feuille-de-route/${uidFeuilleDeRoute}/action/actionFooId2/modifier`,
        urlVisualiser: `/gouvernance/${codeDepartement}/feuille-de-route/${uidFeuilleDeRoute}/action/actionFooId2/visualiser`,
      },
    ],
    budgets: {
      cofinancement: formatMontant(90_000),
      etat: formatMontant(30_000),
      total: formatMontant(140_000),
    },
    contextualisation: '<p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p>',
    formulaire: {
      membres: [
        {
          isSelected: false,
          label: 'Choisir',
          value: 'choisir',
        },
        {
          isSelected: false,
          label: 'Croix Rouge Française',
          value: 'membre1FooId',
        },
        {
          isSelected: true,
          label: 'La Poste',
          value: 'membre2FooId',
        },
      ],
      perimetres: [
        {
          isSelected: false,
          label: 'Régional',
          value: 'regional',
        },
        {
          isSelected: true,
          label: 'Départemental',
          value: 'departemental',
        },
        {
          isSelected: false,
          label: 'EPCI ou groupement de communes',
          value: 'groupementsDeCommunes',
        },
      ],
    },
    historiques: [
      {
        date: '12/02/2024',
        editeur: 'Par Banque des territoires',
        libelle: 'Versement effectué',
      },
      {
        date: '08/02/2024',
        editeur: 'Par ANCT',
        libelle: 'Demande acceptée',
      },
      {
        date: '15/01/2024',
        editeur: 'Par Lucie B',
        libelle: 'Action Structurer un fonds local pour l‘inclusion numérique',
      },
    ],
    infosActions: '3 actions, 5 bénéficiaires, 3 co-financeurs',
    infosDerniereEdition: 'Modifiée le 23/11/2024 par ~ ~',
    nom: 'Feuille de route FNE',
    perimetre: 'Périmètre départemental',
    porteur: {
      label: 'Orange',
      link: `/gouvernance/${codeDepartement}/membre/membreFooId`,
    },
    uidFeuilleDeRoute: 'feuilleDeRouteFooId',
    uidGouvernance: 'gouvernanceFooId',
    urlAjouterUneAction: `/gouvernance/${codeDepartement}/feuille-de-route/${uidFeuilleDeRoute}/action/ajouter`,
    ...override,
  }
}
