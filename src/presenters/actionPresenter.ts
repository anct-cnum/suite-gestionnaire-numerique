import { ActionStatutViewModel, actionStatutViewModelByStatut } from './shared/action'
import { LabelValue } from './shared/labels'
import { formatMontant } from './shared/number'
import { PorteurPotentielViewModel } from './shared/PorteurPotentiel'
import { BesoinsPossible, UneActionReadModel } from '@/use-cases/queries/RecupererUneAction'
import { StatutSubvention } from '@/use-cases/queries/shared/ActionReadModel'

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

export function actionPresenter2(action: undefined | UneActionReadModel): ActionViewModel {
  if (!action) {
    return actionARemplir(undefined)
  }

  // Répartition des besoins dans les catégories attendues
  const besoinsFinancements = [
    'structurer_fond_local',
    'monter_dossier_subvention',
    'animer_et_mettre_en_oeuvre_gouvernance',
  ]
  const besoinsFormations = [
    'etablir_diagnostic_territorial',
    'coconstruire_feuille_avec_membres',
    'rediger_feuille',
    'appui_juridique_dedie_gouvernance',
  ]
  const besoinsFormationsProfessionnels = [
    'appuyer_certification_qualiopi',
  ]
  const besoinsOutillages = [
    'structurer_filiere_reconditionnement_locale',
    'collecter_donnees_territoriales',
    'sensibiliser_acteurs',
  ]

  function besoinToLabelValue(besoin: string): BesoinsPotentielle {
    switch (besoin) {
      case 'animer_et_mettre_en_oeuvre_gouvernance':
        return { isSelected: true, label: 'Animer et mettre en œuvre la gouvernance et la feuille de route', value: besoin }
      case 'appui_juridique_dedie_gouvernance':
        return { isSelected: true, label: 'Appui juridique dédié à la gouvernance', value: besoin }
      case 'appuyer_certification_qualiopi':
        return { isSelected: true, label: 'Appuyer la certification Qualiopi de structures privées portant des formations à l’inclusion numérique', value: besoin }
      case 'coconstruire_feuille_avec_membres':
        return { isSelected: true, label: 'Co-construire la feuille de route avec les membres', value: besoin }
      case 'collecter_donnees_territoriales':
        return { isSelected: true, label: 'Collecter des données territoriales pour alimenter un hub national', value: besoin }
      case 'etablir_diagnostic_territorial':
        return { isSelected: true, label: 'Établir un diagnostic territorial', value: besoin }
      case 'monter_dossier_subvention':
        return { isSelected: true, label: 'Monter des dossiers de subvention complexes', value: besoin }
      case 'rediger_feuille':
        return { isSelected: true, label: 'Rédiger la feuille de route', value: besoin }
      case 'sensibiliser_acteurs':
        return { isSelected: true, label: 'Sensibiliser les acteur de l’inclusion numérique aux outils existants', value: besoin }
      case 'structurer_filiere_reconditionnement_locale':
        return { isSelected: true, label: 'Structurer une filière de reconditionnement locale', value: besoin }
      case 'structurer_fond_local':
        return { isSelected: true, label: 'Structurer un fond local pour l’inclusion numérique', value: besoin }
      default:
        return { isSelected: true, label: besoin, value: besoin as BesoinsPossible }
    }
  }

  const besoins = {
    financements: besoinsFinancements
      .map(b => action.besoins.includes(b) ? besoinToLabelValue(b) : { ...besoinToLabelValue(b), isSelected: false }),
    formations: besoinsFormations
      .map(b => action.besoins.includes(b) ? besoinToLabelValue(b) : { ...besoinToLabelValue(b), isSelected: false }),
    formationsProfessionnels: besoinsFormationsProfessionnels
      .map(b => action.besoins.includes(b) ? besoinToLabelValue(b) : { ...besoinToLabelValue(b), isSelected: false }),
    outillages: besoinsOutillages
      .map(b => action.besoins.includes(b) ? besoinToLabelValue(b) : { ...besoinToLabelValue(b), isSelected: false }),
  }

  return {
    anneeDeDebut: action.anneeDeDebut ?? '',
    anneeDeFin: action.anneeDeFin,
    beneficiaires: (action.beneficiaires ?? []).map(toPorteurPotentielViewModel),
    besoins,
    budgetGlobal: action.budgetGlobal ?? 0,
    budgetPrevisionnel: (action.budgetPrevisionnel ?? []).map(bp => ({
      coFinanceur: bp.coFinanceur,
      montant: formatMontant(bp.montant),
    })),
    contexte: action.contexte ?? '',
    description: action.description ?? '',
    enveloppes,
    hasBesoins: checkHasBesoins(besoins),
    lienPourModifier: 'LIEN BLABLA', // à compléter si besoin
    nom: action.nom,
    nomFeuilleDeRoute: 'BLABLA', // à compléter si besoin
    porteurs: (action.porteurs ?? []).map(toPorteurPotentielViewModel),
    statut: actionStatutViewModelByStatut[action.statut as StatutSubvention] ?? {
      background: 'blue',
      icon: '',
      libelle: action.statut,
      variant: 'new',
    },
    temporalite: 'annuelle',
    totaux: {
      coFinancement: formatMontant(action.coFinancement.montant ?? 0),
      financementAccorde: formatMontant(action.enveloppe.montant ?? 0),
    },
    uid: action.uid,
    urlFeuilleDeRoute: '', // à compléter si besoin
    urlGouvernance: '', // à compléter si besoin
  }
}

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
        coFinanceur: 'Conseil departemental',
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

// eslint-disable-next-line complexity
export function actionARemplir(action: undefined | UneActionReadModel): ActionViewModel {
  return {
    anneeDeDebut: '',
    anneeDeFin: '',
    beneficiaires: [],
    besoins: {
      financements: [
        {
          isSelected: action?.besoins.includes('structurer_fond_local') ?? false,
          label: 'Structurer un fond local pour l’inclusion numérique',
          value: 'structurer_fond_local',
        },
        {
          isSelected: action?.besoins.includes('monter_dossier_subvention') ?? false,
          label: 'Monter des dossiers de subvention complexes',
          value: 'monter_dossier_subvention',
        },
        {
          isSelected: action?.besoins.includes('animer_et_mettre_en_oeuvre_gouvernance') ?? false,
          label: 'Animer et mettre en œuvre la gouvernance et la feuille de route',
          value: 'animer_et_mettre_en_oeuvre_gouvernance',
        },
      ],
      formations: [
        {
          isSelected: action?.besoins.includes('etablir_diagnostic_territorial') ?? false,
          label: 'Établir un diagnostic territorial',
          value: 'etablir_diagnostic_territorial',
        },
        {
          isSelected: action?.besoins.includes('coconstruire_feuille_avec_membres') ?? false,
          label: 'Co-construire la feuille de route avec les membres',
          value: 'coconstruire_feuille_avec_membres',
        },
        {
          isSelected: action?.besoins.includes('rediger_feuille') ?? false,
          label: 'Rédiger la feuille de route',
          value: 'rediger_feuille',
        },
        {
          isSelected: action?.besoins.includes('appui_juridique_dedie_gouvernance') ?? false,
          label: 'Appui juridique dédié à la gouvernance',
          value: 'appui_juridique_dedie_gouvernance',
        },
      ],
      formationsProfessionnels: [
        {
          isSelected: action?.besoins.includes('appuyer_certification_qualiopi') ?? false,
          label: 'Appuyer la certification Qualiopi de structures privées portant des formations à l’inclusion numérique',
          value: 'appuyer_certification_qualiopi',
        },
      ],
      outillages: [
        {
          isSelected: action?.besoins.includes('structurer_filiere_reconditionnement_locale') ?? false,
          label: 'Structurer une filière de reconditionnement locale',
          value: 'structurer_filiere_reconditionnement_locale',
        },
        {
          isSelected: action?.besoins.includes('collecter_donnees_territoriales') ?? false,
          label: 'Collecter des données territoriales pour alimenter un hub national',
          value: 'collecter_donnees_territoriales',
        },
        {
          isSelected: action?.besoins.includes('sensibiliser_acteurs') ?? false ,
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

function toPorteurPotentielViewModel(
  porteur: { id: string; nom: string }
): PorteurPotentielViewModel {
  return {
    id: porteur.id,
    link: '', // à compléter si besoin
    nom: porteur.nom,
    roles: [], // à compléter si besoin
  }
}

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
