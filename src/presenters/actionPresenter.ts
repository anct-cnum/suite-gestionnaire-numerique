import { ActionStatutViewModel, actionStatutViewModelByStatut } from './shared/action'
import { LabelValue } from './shared/labelValue'
import { formatMontant } from './shared/number'

const enveloppes: ReadonlyArray<Enveloppe> = [
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

export function actionPresenter(codeDepartement: string): ActionViewModel {
  return {
    anneeDeDebut: '2025',
    anneeDeFin: undefined,
    beneficiaires: [
      {
        color: 'info',
        isChecked: true,
        label: 'Rhône (69)',
        statut: 'Co-porteur',
        value: 'membreFooId3',
      },
      {
        color: 'info',
        isChecked: false,
        label: 'CC des Monts du Lyonnais',
        statut: 'Co-porteur',
        value: 'membreFooId4',
      },
    ],
    besoins: {
      financements: [
        {
          isChecked: false,
          label: 'Structurer un fond local pour l’inclusion numérique',
          value: 'structurer_fond_local',
        },
        {
          isChecked: false,
          label: 'Monter des dossiers de subvention complexes',
          value: 'monter_dossier_subvention',
        },
        {
          isChecked: true,
          label: 'Animer et mettre en œuvre la gouvernance et la feuille de route',
          value: 'animer_et_mettre_en_oeuvre_gouvernance',
        },
      ],
      formations: [
        {
          isChecked: true,
          label: 'Établir un diagnostic territorial',
          value: 'etablir_diagnostic_territorial',
        },
        {
          isChecked: false,
          label: 'Co-construire la feuille de route avec les membres',
          value: 'coconstruire_feuille_avec_membres',
        },
        {
          isChecked: false,
          label: 'Rédiger la feuille de route',
          value: 'rediger_feuille',
        },
        {
          isChecked: false,
          label: 'Appui juridique dédié à la gouvernance',
          value: 'appui_juridique_dedie_gouvernance',
        },
      ],
      formationsProfessionnels: [
        {
          isChecked: false,
          label: 'Appuyer la certification Qualiopi de structures privées portant des formations à l’inclusion numérique',
          value: 'appuyer_certification_qualiopi',
        },
      ],
      outillages: [
        {
          isChecked: false,
          label: 'Structurer une filière de reconditionnement locale',
          value: 'structurer_filiere_reconditionnement_locale',
        },
        {
          isChecked: false,
          label: 'Collecter des données territoriales pour alimenter un hub national',
          value: 'collecter_donnees_territoriales',
        },
        {
          isChecked: false,
          label: 'Sensibiliser les acteur de l’inclusion numérique aux outils existants',
          value: 'sensibiliser_acteurs',
        },
      ],
    },
    budgetGlobal: 40_000,
    budgetPrevisionnel: [
      {
        coFinanceur: 'Budget prévisionnel 2024',
        montant: formatMontant(20_000),
      },
      {
        coFinanceur: 'Subvention de prestation',
        montant: formatMontant(10_000),
      },
      {
        coFinanceur: 'CC des Monts du Lyonnais',
        montant: formatMontant(5_000),
      },
      {
        coFinanceur: 'Croix Rouge Française',
        montant: formatMontant(5_000),
      },
    ],
    contexte: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
    description: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
    enveloppes,
    hasBesoins: checkHasBesoins({
      financements: [
        {
          isChecked: true,
          label: 'Structurer un fond local pour l’inclusion numérique',
          value: 'structurer_fond_local',
        }],
      formations: [
        {
          isChecked: true,
          label: 'Établir un diagnostic territorial',
          value: 'etablir_diagnostic_territorial',
        }],
      formationsProfessionnels: [],
      outillages: [],
    }),
    lienPourModifier: `/gouvernance/${codeDepartement}/feuille-de-route/uid-feuille/action/uid-action/modifier`,
    nom: 'Action test',
    nomFeuilleDeRoute: 'Feuille de route 69',
    porteurs: [
      {
        color: 'info',
        isChecked: false,
        label: 'Rhône (69)',
        statut: 'Co-porteur',
        value: 'membreFooId1',
      },
      {
        color: 'info',
        isChecked: true,
        label: 'CC des Monts du Lyonnais',
        statut: 'Co-porteur',
        value: 'membreFooId2',
      },
    ],
    statut: actionStatutViewModelByStatut.deposee,
    temporalite: 'annuelle',
    totaux: {
      coFinancement: formatMontant(20_000),
      financementAccorde: formatMontant(20_000),
    },
    uid: 'uid-action',
    urlFeuilleDeRoute: `/gouvernance/${codeDepartement}/feuille-de-route/116`,
    urlGouvernance: `/gouvernance/${codeDepartement}`,
  }
}

export type ActionViewModel = Readonly<{
  hasBesoins: boolean
  nomFeuilleDeRoute: string
  beneficiaires: Beneficiaires
  besoins: Readonly<{
    financements: Besoins
    formations: Besoins
    formationsProfessionnels: Besoins
    outillages: Besoins
  }>
  budgetPrevisionnel: ReadonlyArray<{
    coFinanceur: string
    montant: string
  }>
  budgetGlobal: number
  enveloppes: ReadonlyArray<Enveloppe>
  description: string
  contexte: string
  lienPourModifier: string
  nom: string
  porteurs: Porteurs
  statut: ActionStatutViewModel
  totaux: Readonly<{
    coFinancement: string
    financementAccorde: string
  }>
  uid: string
  urlGouvernance: string
  urlFeuilleDeRoute: string
  temporalite: 'pluriannuelle' | 'annuelle'
  anneeDeDebut: string
  anneeDeFin?: string
}>

export const actionARemplir: ActionViewModel = {
  anneeDeDebut: '',
  anneeDeFin: '',
  beneficiaires: [
    {
      color: 'info',
      isChecked: false,
      label: 'Rhône (69)',
      statut: 'Co-porteur',
      value: 'membreFooId3',
    },
    {
      color: 'info',
      isChecked: false,
      label: 'CC des Monts du Lyonnais',
      statut: 'Co-porteur',
      value: 'membreFooId4',
    },
  ],
  besoins: {
    financements: [
      {
        isChecked: false,
        label: 'Structurer un fond local pour l’inclusion numérique',
        value: 'structurer_fond_local',
      },
      {
        isChecked: false,
        label: 'Monter des dossiers de subvention complexes',
        value: 'monter_dossier_subvention',
      },
      {
        isChecked: false,
        label: 'Animer et mettre en œuvre la gouvernance et la feuille de route',
        value: 'animer_et_mettre_en_oeuvre_gouvernance',
      },
    ],
    formations: [
      {
        isChecked: false,
        label: 'Établir un diagnostic territorial',
        value: 'etablir_diagnostic_territorial',
      },
      {
        isChecked: false,
        label: 'Co-construire la feuille de route avec les membres',
        value: 'coconstruire_feuille_avec_membres',
      },
      {
        isChecked: false,
        label: 'Rédiger la feuille de route',
        value: 'rediger_feuille',
      },
      {
        isChecked: false,
        label: 'Appui juridique dédié à la gouvernance',
        value: 'appui_juridique_dedie_gouvernance',
      },
    ],
    formationsProfessionnels: [
      {
        isChecked: false,
        label: 'Appuyer la certification Qualiopi de structures privées portant des formations à l’inclusion numérique',
        value: 'appuyer_certification_qualiopi',
      },
    ],
    outillages: [
      {
        isChecked: false,
        label: 'Structurer une filière de reconditionnement locale',
        value: 'structurer_filiere_reconditionnement_locale',
      },
      {
        isChecked: false,
        label: 'Collecter des données territoriales pour alimenter un hub national',
        value: 'collecter_donnees_territoriales',
      },
      {
        isChecked: false,
        label: 'Sensibiliser les acteur de l’inclusion numérique aux outils existants',
        value: 'sensibiliser_acteurs',
      },
    ],
  },
  budgetGlobal: 0,
  budgetPrevisionnel: [],
  contexte: '',
  description: '',
  enveloppes,
  hasBesoins: checkHasBesoins({
    financements: [
      {
        isChecked: false,
        label: 'Structurer un fond local pour l’inclusion numérique',
        value: 'structurer_fond_local',
      }],
    formations: [
      {
        isChecked: false,
        label: 'Établir un diagnostic territorial',
        value: 'etablir_diagnostic_territorial',
      }],
    formationsProfessionnels: [],
    outillages: [],
  }),
  lienPourModifier: '',
  nom: '',
  nomFeuilleDeRoute: 'Feuille de route 69',
  porteurs: [
    {
      color: 'info',
      isChecked: false,
      label: 'Rhône (69)',
      statut: 'Co-porteur',
      value: 'membreFooId1',
    },
    {
      color: 'info',
      isChecked: false,
      label: 'CC des Monts du Lyonnais',
      statut: 'Co-porteur',
      value: 'membreFooId2',
    },
  ],
  statut: {
    background: 'blue',
    icon: '',
    iconStyle: '',
    libelle: '',
    variant: 'new',
  },
  temporalite: 'annuelle',
  totaux: {
    coFinancement: '',
    financementAccorde: '',
  },
  uid: '',
  urlFeuilleDeRoute: '/gouvernance/11/feuille-de-route/116',
  urlGouvernance: '/gouvernance/11',
}

export type Besoins = ReadonlyArray<{
  isChecked: boolean
  label: string
  value: string
}>

export type Porteurs = ReadonlyArray<{
  color: 'success' | 'error' | 'info' | 'warning' | 'new'
  isChecked: boolean
  label: string
  statut: string
  value: string
}>

export type Beneficiaires = ReadonlyArray<{
  color: 'success' | 'error' | 'info' | 'warning' | 'new'
  isChecked: boolean
  label: string
  statut: string
  value: string
}>

function checkHasBesoins(besoins: {
  financements: Besoins
  formations: Besoins
  formationsProfessionnels: Besoins
  outillages: Besoins
}): boolean {
  return (
    besoins.financements.some(item => item.isChecked) ||
    besoins.formations.some(item => item.isChecked) ||
    besoins.formationsProfessionnels.some(item => item.isChecked) ||
    besoins.outillages.some(item => item.isChecked)
  )
}

type Enveloppe = LabelValue & Readonly<{ budget: number }>
