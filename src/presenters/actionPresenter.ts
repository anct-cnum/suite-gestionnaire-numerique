import { ActionStatutViewModel, actionStatutViewModelByStatut } from './shared/action'
import { LabelValue } from './shared/labels'
import { formatMontant } from './shared/number'
import { PorteurPotentielViewModel } from './shared/PorteurPotentiel'
import { BesoinsPossible, UneActionReadModel } from '@/use-cases/queries/RecupererUneAction'

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
    beneficiaires: [],
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

export type DemandeDeSubvention = Readonly<{
  enveloppe: Enveloppe
  montantPrestation: number
  montantRh: number
  total: number
}>

export type ActionViewModel = Readonly<{
  anneeDeDebut: string
  anneeDeFin?: string
  beneficiaires: Array<PorteurPotentielViewModel>
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
  demandeDeSubvention?: DemandeDeSubvention
  description: string
  enveloppes: ReadonlyArray<Enveloppe>
  hasBesoins: boolean
  lienPourModifier: string
  nom: string
  nomFeuilleDeRoute: string
  porteurs: Array<PorteurPotentielViewModel>
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

export function actionARemplir(action: UneActionReadModel): ActionViewModel {
  const besoins: ActionViewModel['besoins'] = {
    financements: [
      {
        isSelected: action.besoins?.includes('structurer_fond_local'),
        label: 'Structurer un fond local pour l’inclusion numérique',
        value: 'structurer_fond_local',
      },
      {
        isSelected: action.besoins?.includes('monter_dossier_subvention'),
        label: 'Monter des dossiers de subvention complexes',
        value: 'monter_dossier_subvention',
      },
      {
        isSelected: action.besoins?.includes('animer_et_mettre_en_oeuvre_gouvernance'),
        label: 'Animer et mettre en œuvre la gouvernance et la feuille de route',
        value: 'animer_et_mettre_en_oeuvre_gouvernance',
      },
    ],
    formations: [
      {
        isSelected: action.besoins?.includes('etablir_diagnostic_territorial'),
        label: 'Établir un diagnostic territorial',
        value: 'etablir_diagnostic_territorial',
      },
      {
        isSelected: action.besoins?.includes('coconstruire_feuille_avec_membres'),
        label: 'Co-construire la feuille de route avec les membres',
        value: 'coconstruire_feuille_avec_membres',
      },
      {
        isSelected: action.besoins?.includes('rediger_feuille'),
        label: 'Rédiger la feuille de route',
        value: 'rediger_feuille',
      },
      {
        isSelected: action.besoins?.includes('appui_juridique_dedie_gouvernance'),
        label: 'Appui juridique dédié à la gouvernance',
        value: 'appui_juridique_dedie_gouvernance',
      },
    ],
    formationsProfessionnels: [
      {
        isSelected: action.besoins?.includes('appuyer_certification_qualiopi'),
        label: 'Appuyer la certification Qualiopi de structures privées portant des formations à l’inclusion numérique',
        value: 'appuyer_certification_qualiopi',
      },
    ],
    outillages: [
      {
        isSelected: action.besoins?.includes('structurer_filiere_reconditionnement_locale'),
        label: 'Structurer une filière de reconditionnement locale',
        value: 'structurer_filiere_reconditionnement_locale',
      },
      {
        isSelected: action.besoins?.includes('collecter_donnees_territoriales'),
        label: 'Collecter des données territoriales pour alimenter un hub national',
        value: 'collecter_donnees_territoriales',
      },
      {
        isSelected: action.besoins?.includes('sensibiliser_acteurs'),
        label: 'Sensibiliser les acteur de l’inclusion numérique aux outils existants',
        value: 'sensibiliser_acteurs',
      },
    ],
  }
  return {
    anneeDeDebut: '',
    anneeDeFin: '',
    beneficiaires: [],
    besoins,
    budgetGlobal: 0,
    budgetPrevisionnel: [],
    contexte: '',
    demandeDeSubvention: undefined,
    description: '',
    enveloppes,
    hasBesoins: checkHasBesoins(besoins),
    lienPourModifier: '',
    nom: '',
    nomFeuilleDeRoute: 'Feuille de route 69',
    porteurs: [],
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
}

export type BesoinsPotentielle = LabelValue<BesoinsPossible>

export type Besoins = ReadonlyArray<BesoinsPotentielle>

export type Enveloppe = LabelValue & Readonly<{ budget: number }>

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
