import { ActionStatutViewModel, actionStatutViewModelByStatut } from './shared/action'
import { BESOINS_CATEGORIES, createBesoinsLabelValue } from './shared/besoins'
import { Enveloppe } from './shared/enveloppe'
import { LabelValue } from './shared/labels'
import { formatMontant } from './shared/number'
import { PorteurPotentielViewModel } from './shared/PorteurPotentiel'
import { CoFinancementReadModel, UneActionReadModel } from '@/use-cases/queries/RecupererUneAction'
import { BesoinsPossible } from '@/use-cases/queries/shared/ActionReadModel'
import { StatutSubvention } from "@/domain/DemandeDeSubvention"

export function actionPresenter(action: undefined | UneActionReadModel,
  { enveloppes, nomFeuilleDeRoute, urlFeuilleDeRoute, urlGestionMembresGouvernance }: 
  { enveloppes: ReadonlyArray<Enveloppe>
    nomFeuilleDeRoute: string
    urlFeuilleDeRoute: string
    urlGestionMembresGouvernance: string }): ActionViewModel {
  if (!action) {
    return actionARemplir(undefined, { enveloppes, nomFeuilleDeRoute, urlFeuilleDeRoute, urlGestionMembresGouvernance })
  }

  const besoins = transformBesoins(action.besoins as Array<BesoinsPossible>)
  const demandeDeSubventionAction = action.demandeDeSubvention
  let demandeDeSubvention : DemandeDeSubvention | undefined
  if (demandeDeSubventionAction) {
    demandeDeSubvention = {
      enveloppeId: demandeDeSubventionAction.enveloppeFinancementId,
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
  enveloppeId : string
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
  { enveloppes, nomFeuilleDeRoute, urlFeuilleDeRoute, urlGestionMembresGouvernance }: 
  { enveloppes: ReadonlyArray<Enveloppe>
    nomFeuilleDeRoute: string 
    urlFeuilleDeRoute: string 
    urlGestionMembresGouvernance: string }): ActionViewModel {
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
    financements: BESOINS_CATEGORIES.financements.map(besoin => 
      createBesoinsLabelValue(besoin, actionBesoins.includes(besoin))),
    formations: BESOINS_CATEGORIES.formations.map(besoin => 
      createBesoinsLabelValue(besoin, actionBesoins.includes(besoin))),
    formationsProfessionnels: BESOINS_CATEGORIES.formationsProfessionnels.map(besoin => 
      createBesoinsLabelValue(besoin, actionBesoins.includes(besoin))),
    outillages: BESOINS_CATEGORIES.outillages.map(besoin => 
      createBesoinsLabelValue(besoin, actionBesoins.includes(besoin))),
  }
}

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
