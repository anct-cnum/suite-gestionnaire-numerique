import { ActionStatutViewModel, actionStatutViewModelByStatut } from './shared/action'
import { LabelValue } from './shared/labels'
import { formatMontant } from './shared/number'
import { PorteurPotentielViewModel } from './shared/PorteurPotentiel'
import { BesoinsPossible, CoFinancementReadModel, UneActionReadModel } from '@/use-cases/queries/RecupererUneAction'
import { StatutSubvention } from '@/use-cases/queries/shared/ActionReadModel'
// istanbul ignore next @preserve
const enveloppes: ReadonlyArray<Enveloppe> = [
  {
    budgetPartage: false,
    enabled: false,
    isSelected: false,
    label: 'Conseiller Numérique - 2024',
    value: '1',
  },
  {
    
    budgetPartage: false,
    enabled: true,
    isSelected: false,
    label: 'Conseiller Numérique - Plan France Relance',
    value: '2',
  },
  {
    budget: 30_000,
    budgetPartage: true,
    enabled: false,
    isSelected: false,
    label: 'Formation Aidant Numérique/Aidants Connect - 2024',
    value: '3',
  },
  {
    
    budget: 120_000,
    budgetPartage: true,
    enabled: true,
    isSelected: false,
    label: 'Ingénierie France Numérique Ensemble - 2024',
    value: '4',
  },
]

export function actionPresenter(action: undefined | UneActionReadModel,
  { nomFeuilleDeRoute, urlFeuilleDeRoute, urlGestionMembresGouvernance }: 
  { nomFeuilleDeRoute: string; urlFeuilleDeRoute: string; urlGestionMembresGouvernance: string }): ActionViewModel {
  if (!action) {
    return actionARemplir(undefined, { nomFeuilleDeRoute, urlFeuilleDeRoute, urlGestionMembresGouvernance })
  }

  const besoins = transformBesoins(action.besoins as Array<BesoinsPossible>)
  const demandeDeSubventionAction = action.demandeDeSubvention
  let demandeDeSubvention : DemandeDeSubvention | undefined
  if (demandeDeSubventionAction) {
    demandeDeSubvention = {
      enveloppe: enveloppes.find(
        enveloppe => enveloppe.value ===demandeDeSubventionAction.enveloppeFinancementId
      ) ?? enveloppes[0],
      montantPrestation: demandeDeSubventionAction.subventionPrestation,
      montantRh: demandeDeSubventionAction.subventionEtp ,
      total:demandeDeSubventionAction.subventionDemandee,
    }
  }
  return {
    anneeDeDebut: action.anneeDeDebut ?? '',
    anneeDeFin: action.anneeDeFin,
    besoins,
    budgetGlobal: action.budgetGlobal ?? 0,
    cofinancements: action.coFinancements.map(
      (coFinancement: CoFinancementReadModel) => {
        return {
          coFinanceur : coFinancement.id,
          montant: String(coFinancement.montant),
        } as CofinamencemenViewModel}
    ),
    contexte: action.contexte ?? '',
    demandeDeSubvention,
    description: action.description ?? '',
    destinataires: (action.destinataires ?? []).map(toPorteurPotentielViewModel),
    enveloppes,
    hasBesoins: checkHasBesoins(besoins),
    lienPourModifier: 'LIEN BLABLA', // à compléter si besoin
    nom: action.nom,
    nomFeuilleDeRoute: action.nomFeuilleDeRoute,
    porteurs: (action.porteurs ?? []).map(toPorteurPotentielViewModel),
    statut: actionStatutViewModelByStatut[action.statut as StatutSubvention],
    temporalite: 'annuelle',
    totaux: {
      coFinancement: formatMontant(233),
      financementAccorde: formatMontant(action.demandeDeSubvention?.subventionDemandee ?? 0),
    },
    uid: action.uid,
    urlFeuilleDeRoute,
    urlGestionMembresGouvernance,
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
  besoins: Readonly<{
    financements: Besoins
    formations: Besoins
    formationsProfessionnels: Besoins
    outillages: Besoins
  }>
  budgetGlobal: number
  cofinancements: ReadonlyArray<CofinamencemenViewModel>
  contexte: string
  demandeDeSubvention?: DemandeDeSubvention
  description: string
  destinataires: Array<PorteurPotentielViewModel>
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
  urlGestionMembresGouvernance: string
}>

export function actionARemplir(action: undefined | UneActionReadModel, 
  { nomFeuilleDeRoute, urlFeuilleDeRoute, urlGestionMembresGouvernance }: 
  { nomFeuilleDeRoute: string; urlFeuilleDeRoute: string; urlGestionMembresGouvernance: string }): ActionViewModel {
  return {
    anneeDeDebut: '',
    anneeDeFin: '',
    besoins: transformBesoins(action?.besoins as Array<BesoinsPossible>),
    budgetGlobal: 0,
    cofinancements: [],
    contexte: '',
    demandeDeSubvention: undefined,
    description: '',
    destinataires: [],
    enveloppes,
    hasBesoins: checkHasBesoins({
      financements: [
        {
          isSelected: false,
          label: 'Structurer un fond local pour l’inclusion numérique',
          value: BesoinsPossible.STRUCTURER_UN_FONDS,
        }],
      formations: [
        {
          isSelected: false,
          label: 'Établir un diagnostic territorial',
          value: BesoinsPossible.ETABLIR_UN_DIAGNOSTIC_TERRITORIAL,
        }],
      formationsProfessionnels: [],
      outillages: [],
    }),
    lienPourModifier: '',
    nom: '',
    nomFeuilleDeRoute,
    porteurs: [],
    statut: {
      background: 'blue',
      display: true,
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
    urlFeuilleDeRoute,
    urlGestionMembresGouvernance,
  }
}

export type BesoinsPotentielle = LabelValue<BesoinsPossible>

export type Besoins = ReadonlyArray<BesoinsPotentielle>

export function transformBesoins(actionBesoins: Array<BesoinsPossible> = []): {
  financements: Besoins
  formations: Besoins
  formationsProfessionnels: Besoins
  outillages: Besoins
} {
  return {
    financements: [
      {
        isSelected: actionBesoins.includes(BesoinsPossible.STRUCTURER_UN_FONDS),
        label: 'Structurer un fond local pour l’inclusion numérique',
        value: BesoinsPossible.STRUCTURER_UN_FONDS,
      },
      {
        isSelected: actionBesoins.includes(BesoinsPossible.MONTER_DOSSIERS_DE_SUBVENSION),
        label: 'Monter des dossiers de subvention complexes',
        value: BesoinsPossible.MONTER_DOSSIERS_DE_SUBVENSION,
      },
      {
        isSelected: actionBesoins.includes(BesoinsPossible.ANIMER_LA_GOUVERNANCE),
        label: 'Animer et mettre en œuvre la gouvernance et la feuille de route',
        value: BesoinsPossible.ANIMER_LA_GOUVERNANCE,
      },
    ],
    formations: [
      {
        isSelected: actionBesoins.includes(BesoinsPossible.ETABLIR_UN_DIAGNOSTIC_TERRITORIAL),
        label: 'Établir un diagnostic territorial',
        value: BesoinsPossible.ETABLIR_UN_DIAGNOSTIC_TERRITORIAL,
      },
      {
        isSelected: actionBesoins.includes(BesoinsPossible.CO_CONSTRUIRE_LA_FEUILLE_DE_ROUTE),
        label: 'Co-construire la feuille de route avec les membres',
        value: BesoinsPossible.CO_CONSTRUIRE_LA_FEUILLE_DE_ROUTE,
      },
      {
        isSelected: actionBesoins.includes(BesoinsPossible.REDIGER_LA_FEUILLE_DE_ROUTE),
        label: 'Rédiger la feuille de route',
        value: BesoinsPossible.REDIGER_LA_FEUILLE_DE_ROUTE,
      },
      { 
        isSelected: actionBesoins.includes(BesoinsPossible.APPUI_JURIDIQUE),
        label: 'Appui juridique dédié à la gouvernance',
        value: BesoinsPossible.APPUI_JURIDIQUE,
      },
    ],
    formationsProfessionnels: [
      {
        isSelected: actionBesoins.includes(BesoinsPossible.APPUYER_LA_CERTIFICATION_QUALIOPI),
        label: 'Appuyer la certification Qualiopi de structures privées portant des formations à l’inclusion numérique',
        value: BesoinsPossible.APPUYER_LA_CERTIFICATION_QUALIOPI,
      },
    ],
    outillages: [
      {
        isSelected: actionBesoins.includes(BesoinsPossible.STRUCTURER_UNE_FILIERE_DE_RECONDITIONNEMENT),
        label: 'Structurer une filière de reconditionnement locale',
        value: BesoinsPossible.STRUCTURER_UNE_FILIERE_DE_RECONDITIONNEMENT,
      },
      { 
        isSelected: actionBesoins.includes(BesoinsPossible.COLLECTER_DES_DONNEES_TERRITORIALES),
        label: 'Collecter des données territoriales pour alimenter un hub national',
        value: BesoinsPossible.COLLECTER_DES_DONNEES_TERRITORIALES,
      },
      {
        isSelected: actionBesoins.includes(BesoinsPossible.SENSIBILISER_LES_ACTEURS_AUX_OUTILS_EXISTANTS),
        label: 'Sensibiliser les acteur de l’inclusion numérique aux outils existants',
        value: BesoinsPossible.SENSIBILISER_LES_ACTEURS_AUX_OUTILS_EXISTANTS,
      },
    ],
  }
}

export type Enveloppe = (
  | (LabelValue & Readonly<{ budget: number; budgetPartage: true; enabled: boolean }>)
  | (LabelValue & Readonly<{ budgetPartage: false; enabled: boolean }>)
)

interface CofinamencemenViewModel {
  coFinanceur: string
  montant: string
}
function toPorteurPotentielViewModel(
  porteur: { id: string; lien: string; nom: string }
): PorteurPotentielViewModel {
  return {
    id: porteur.id,
    link: porteur.lien,
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
