import { ActionStatutViewModel, actionStatutViewModelByStatut } from './shared/action'
import { LabelValue } from './shared/labels'
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
        isSelected: true,
        label: 'Rhône (69)',
        lien: '/gouvernance/69/membre/membreFooId3',
        statut: 'Co-porteur',
        value: 'membreFooId3',
      },
      {
        color: 'info',
        isSelected: false,
        label: 'CC des Monts du Lyonnais',
        lien: '/gouvernance/69/membre/membreFooId4',
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
          isSelected: false,
          label: 'Monter des dossiers de subvention complexes',
          value: 'monter_dossier_subvention',
        },
        {
          isSelected: true,
          label: 'Animer et mettre en œuvre la gouvernance et la feuille de route',
          value: 'animer_et_mettre_en_oeuvre_gouvernance',
        },
      ],
      formations: [
        {
          isSelected: true,
          label: 'Établir un diagnostic territorial',
          value: 'etablir_diagnostic_territorial',
        },
        {
          isSelected: false,
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
          isSelected: true,
          label: 'Structurer un fond local pour l’inclusion numérique',
          value: 'structurer_fond_local',
        }],
      formations: [
        {
          isSelected: true,
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
        isSelected: false,
        label: 'Rhône (69)',
        lien: '/gouvernance/69/membre/membreFooId1',
        statut: 'Co-porteur',
        value: 'membreFooId1',
      },
      {
        color: 'info',
        isSelected: true,
        label: 'CC des Monts du Lyonnais',
        lien: '/gouvernance/69/membre/membreFooId2',
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
  anneeDeDebut: string
  anneeDeFin?: string
  beneficiaires: Beneficiaires
  besoins: Readonly<{
    financements: Besoins
    formations: Besoins
    formationsProfessionnels: Besoins
    outillages: Besoins
  }>
  budgetGlobal: number
  budgetPrevisionnel: ReadonlyArray<{
    coFinanceur: string
    montant: string
  }>
  contexte: string
  description: string
  enveloppes: ReadonlyArray<Enveloppe>
  hasBesoins: boolean
  lienPourModifier: string
  nom: string
  nomFeuilleDeRoute: string
  porteurs: Porteurs
  statut: ActionStatutViewModel
  temporalite: 'annuelle' | 'pluriannuelle'
  totaux: Readonly<{
    coFinancement: string
    financementAccorde: string
  }>
  uid: string
  urlFeuilleDeRoute: string
  urlGouvernance: string
}>

export const actionARemplir: ActionViewModel = {
  anneeDeDebut: '',
  anneeDeFin: '',
  beneficiaires: [
    {
      color: 'info',
      isSelected: false,
      label: 'Rhône (69)',
      lien: '/gouvernance/69/membre/membreFooId3',
      statut: 'Co-porteur',
      value: 'membreFooId3',
    },
    {
      color: 'info',
      isSelected: false,
      label: 'CC des Monts du Lyonnais',
      lien: '/gouvernance/69/membre/membreFooId4',
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
        isSelected: false,
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
        isSelected: false,
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
  budgetGlobal: 0,
  budgetPrevisionnel: [],
  contexte: '',
  description: '',
  enveloppes,
  hasBesoins: checkHasBesoins({
    financements: [
      {
        isSelected: false,
        label: 'Structurer un fond local pour l’inclusion numérique',
        value: 'structurer_fond_local',
      }],
    formations: [
      {
        isSelected: false,
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
      isSelected: false,
      label: 'Rhône (69)',
      lien: '/gouvernance/69/membre/membreFooId1',
      statut: 'Co-porteur',
      value: 'membreFooId1',
    },
    {
      color: 'info',
      isSelected: false,
      label: 'CC des Monts du Lyonnais',
      lien: '/gouvernance/69/membre/membreFooId2',
      statut: 'Co-porteur',
      value: 'membreFooId2',
    },
  ],
  statut: {
    background: 'blue',
    icon: '',
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

export type Besoins = ReadonlyArray<LabelValue>

export type Porteurs = ReadonlyArray<LabelValue & Readonly<{
  color: 'error' | 'info' | 'new' | 'success' | 'warning'
  lien: string
  statut: string
}>>

export type Beneficiaires = ReadonlyArray<LabelValue & Readonly<{
  color: 'error' | 'info' | 'new' | 'success' | 'warning'
  lien: string
  statut: string
}>>

function checkHasBesoins(besoins: {
  financements: Besoins
  formations: Besoins
  formationsProfessionnels: Besoins
  outillages: Besoins
}): boolean {
  return Object.values(besoins)
    .flat()
    .some(besoin => Boolean(besoin.isSelected))
}

type Enveloppe = LabelValue & Readonly<{ budget: number }>
