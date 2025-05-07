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

  const besoins = transformBesoins(action.besoins)

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
 
export function actionARemplir(action: undefined | UneActionReadModel): ActionViewModel {
  return {
    anneeDeDebut: '',
    anneeDeFin: '',
    beneficiaires: [],
    besoins: transformBesoins(action?.besoins),
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

export function transformBesoins(actionBesoins: Array<string> = []): {
  financements: Besoins
  formations: Besoins
  formationsProfessionnels: Besoins
  outillages: Besoins
} {
  return {
    financements: [
      {
        isSelected: actionBesoins.includes('structurer_fond_local'),
        label: 'Structurer un fond local pour l’inclusion numérique',
        value: 'structurer_fond_local',
      },
      {
        isSelected: actionBesoins.includes('monter_dossier_subvention'),
        label: 'Monter des dossiers de subvention complexes',
        value: 'monter_dossier_subvention',
      },
      {
        isSelected: actionBesoins.includes('animer_et_mettre_en_oeuvre_gouvernance'),
        label: 'Animer et mettre en œuvre la gouvernance et la feuille de route',
        value: 'animer_et_mettre_en_oeuvre_gouvernance',
      },
    ],
    formations: [
      {
        isSelected: actionBesoins.includes('etablir_diagnostic_territorial'),
        label: 'Établir un diagnostic territorial',
        value: 'etablir_diagnostic_territorial',
      },
      {
        isSelected: actionBesoins.includes('coconstruire_feuille_avec_membres'),
        label: 'Co-construire la feuille de route avec les membres',
        value: 'coconstruire_feuille_avec_membres',
      },
      {
        isSelected: actionBesoins.includes('rediger_feuille'),
        label: 'Rédiger la feuille de route',
        value: 'rediger_feuille',
      },
      {
        isSelected: actionBesoins.includes('appui_juridique_dedie_gouvernance'),
        label: 'Appui juridique dédié à la gouvernance',
        value: 'appui_juridique_dedie_gouvernance',
      },
    ],
    formationsProfessionnels: [
      {
        isSelected: actionBesoins.includes('appuyer_certification_qualiopi'),
        label: 'Appuyer la certification Qualiopi de structures privées portant des formations à l’inclusion numérique',
        value: 'appuyer_certification_qualiopi',
      },
    ],
    outillages: [
      {
        isSelected: actionBesoins.includes('structurer_filiere_reconditionnement_locale'),
        label: 'Structurer une filière de reconditionnement locale',
        value: 'structurer_filiere_reconditionnement_locale',
      },
      {
        isSelected: actionBesoins.includes('collecter_donnees_territoriales'),
        label: 'Collecter des données territoriales pour alimenter un hub national',
        value: 'collecter_donnees_territoriales',
      },
      {
        isSelected: actionBesoins.includes('sensibiliser_acteurs'),
        label: 'Sensibiliser les acteur de l’inclusion numérique aux outils existants',
        value: 'sensibiliser_acteurs',
      },
    ],
  }
}

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
