/* eslint-disable import/no-restricted-paths */
// Stryker disable all
import { ActionViewModel } from './actionPresenter'
import { FeuilleDeRouteViewModel } from './feuilleDeRoutePresenter'
import { GouvernanceViewModel } from './gouvernancePresenter'
import { SessionUtilisateurViewModel } from './sessionUtilisateurPresenter'
import { actionStatutViewModelByStatut } from './shared/action'
import { formatMontant } from './shared/number'

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
        montant: '20000',
      },
      {
        coFinanceur: 'Subvention de prestation',
        montant: '10000',
      },
      {
        coFinanceur: 'CC des Monts du Lyonnais',
        montant: '5000',
      },
      {
        coFinanceur: 'Croix Rouge Française',
        montant: '5000',
      },
    ],
    contexte: '<p>Contexte de l‘action</p>',
    description: '<p><strong>Description de l‘action.</strong></p>',
    destinataires: [],
    enveloppes,
    hasBesoins: true,
    lienPourModifier: '/gouvernance/11/feuille-de-route/116/action/actionFooId1/modifier',
    nom: 'Structurer une filière de reconditionnement locale 1',
    nomFeuilleDeRoute: 'Feuille de route 69',
    porteurs: [

    ],
    statut: {
      background: 'pink',
      icon: 'fr-icon-flashlight-line',
      libelle: 'Demande déposée',
      variant: 'new',
    },
    temporalite: 'pluriannuelle',
    totaux: {
      coFinancement: '30000',
      financementAccorde: '40000',
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
    besoins: {
      financements: [
        {
          isSelected: false,
          label: 'Structurer un fond local pour l’inclusion numérique',
          value: 'structurer_fond_local',
        },
        {
          isSelected: false,
          label: 'Monter des dossiers de subvention complexes',
          value: 'monter_dossier_subvention',
        },
      ],
      formations: [
        {
          isSelected: false,
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
    destinataires: [],
    enveloppes,
    hasBesoins: false,
    lienPourModifier: '/gouvernance/11/feuille-de-route/116/action/actionFooId1/modifier',
    nom: '',
    nomFeuilleDeRoute: 'Feuille de route 69',
    porteurs: [],
    statut: {
      background: 'pink',
      icon: 'fr-icon-flashlight-line',
      libelle: 'Demande déposée',
      variant: 'new',
    },
    temporalite: 'annuelle',
    totaux: {
      coFinancement: '0',
      financementAccorde: '0',
    },
    uid: 'actionFooId1',
    urlFeuilleDeRoute: '/gouvernance/11/feuille-de-route/116',
    urlGouvernance: '/gouvernance/11',
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
        nom: 'Structurer une filière de reconditionnement locale',
        porteurs: [{
          label: 'CC des Monts du Lyonnais',
          link: `/gouvernance/${codeDepartement}/membre/membreFooId`,
        }],
        statut: actionStatutViewModelByStatut.acceptee,
        uid: 'actionFooId1',
        urlModifier: `/gouvernance/${codeDepartement}/feuille-de-route/${uidFeuilleDeRoute}/action/actionFooId1/modifier`,
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
        nom: 'Formation Aidants Connect',
        porteurs: [{
          label: 'CC des Monts du Lyonnais',
          link: `/gouvernance/${codeDepartement}/membre/membreFooId`,
        }],
        statut: actionStatutViewModelByStatut.refusee,
        uid: 'actionFooId2',
        urlModifier: `/gouvernance/${codeDepartement}/feuille-de-route/${uidFeuilleDeRoute}/action/actionFooId2/modifier`,
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
