import { FeuillesDeRouteReadModel } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

export function mesFeuillesDeRoutePresenter(
  feuillesDeRouteReadModel: FeuillesDeRouteReadModel
): MesFeuillesDeRouteViewModel {
  return {
    feuillesDeRoute: feuillesDeRouteReadModel.feuillesDeRoute.map(toFeuilleDeRouteViewModel),
    titre: `Feuille${formatPluriel(feuillesDeRouteReadModel.feuillesDeRoute.length)} de route · ${feuillesDeRouteReadModel.nomDuDepartement}`,
    totaux: {
      budget: formatMontant(feuillesDeRouteReadModel.totaux.budget),
      coFinancement: formatMontant(feuillesDeRouteReadModel.totaux.coFinancement),
      financementAccorde: formatMontant(feuillesDeRouteReadModel.totaux.financementAccorde),
    },
  }
}

function toFeuilleDeRouteViewModel(feuilleDeRoute: FeuillesDeRouteReadModel['feuillesDeRoute'][0]): FeuilleDeRouteViewModel {
  return {
    actions: feuilleDeRoute.actions.map(toActionViewModel),
    beneficiaires: `${feuilleDeRoute.beneficiaires} bénéficiaire${formatPluriel(feuilleDeRoute.beneficiaires)}`,
    coFinanceurs: `${feuilleDeRoute.coFinanceurs} co-financeur${formatPluriel(feuilleDeRoute.coFinanceurs)}`,
    nom: feuilleDeRoute.nom,
    nombreDActionsAttachees: `${feuilleDeRoute.actions.length} action${formatPluriel(feuilleDeRoute.actions.length)} attachée${formatPluriel(feuilleDeRoute.actions.length)} à cette feuille de route`,
    pieceJointe: undefined,
    porteur: 'CC des Monts du Lyonnais',
    totaux: {
      budget: formatMontant(feuilleDeRoute.totaux.budget),
      coFinancement: formatMontant(feuilleDeRoute.totaux.coFinancement),
      financementAccorde: formatMontant(feuilleDeRoute.totaux.financementAccorde),
    },
    uid: feuilleDeRoute.uid,
    wordingDetailDuBudget: `dont ${formatMontant(feuilleDeRoute.totaux.coFinancement)} de co-financements et ${formatMontant(feuilleDeRoute.totaux.financementAccorde)} des financements accordés`,
  }
}

function toActionViewModel(action: FeuillesDeRouteReadModel['feuillesDeRoute'][0]['actions'][0]): ActionViewModel {
  return {
    nom: action.nom,
    porteur: 'CC des Monts du Lyonnais',
    statut: formatStatutAction(action.statut),
    totaux: {
      coFinancement: formatMontant(action.totaux.coFinancement),
      financementAccorde: formatMontant(action.totaux.financementAccorde),
    },
    uid: action.uid,
  }
}

function formatPluriel(count: number): 's' | '' {
  return count > 1 ? 's' : ''
}

function formatStatutAction(statut: typeof STATUS[keyof typeof STATUS]): ActionStatut {
  const statutMap: Record<typeof STATUS[keyof typeof STATUS], ActionStatut> = {
    [STATUS.deposee]: {
      icon: 'fr-icon-flashlight-line',
      iconStyle: 'pin-action-deposee',
      libelle: 'Demande déposée',
      variant: 'new',
    },
    [STATUS.enCours]: {
      icon: 'fr-icon-user-add-line',
      iconStyle: 'pin-action-en-cours',
      libelle: 'Instruction en cours',
      variant: 'info',
    },
    [STATUS.subventionAcceptee]: {
      icon: 'fr-icon-flashlight-line',
      iconStyle: 'pin-action-acceptee',
      libelle: 'Subvention acceptée',
      variant: 'new',
    },
    [STATUS.subventionRefusee]: {
      icon: 'fr-icon-flashlight-line',
      iconStyle: 'pin-action-refusee',
      libelle: 'Subvention refusée',
      variant: 'error',
    },
  }
  return statutMap[statut]
}

const STATUS = {
  deposee: 'deposee',
  enCours: 'en_cours',
  subventionAcceptee: 'subvention_acceptee',
  subventionRefusee: 'subvention_refusee',
} as const

type ActionStatut = Readonly<{
  libelle: string
  variant: 'success' | 'error' | 'info' | 'warning' | 'new'
  icon: string
  iconStyle: 'pin-action-deposee' | 'pin-action-en-cours' | 'pin-action-acceptee' | 'pin-action-refusee'
}>

type StatutVariant = 'success' | 'error' | 'info' | 'warning' | 'new'

export function formatMontant(montant: number): string {
  return `${montant.toLocaleString('fr-FR')} €`
}

export type MesFeuillesDeRouteViewModel = Readonly<{
  titre: string
  totaux: Readonly<{
    budget: string
    coFinancement: string
    financementAccorde: string
  }>
  feuillesDeRoute: ReadonlyArray<FeuilleDeRouteViewModel>
}>

export type FeuilleDeRouteViewModel = Readonly<{
  nom: string
  uid: string
  porteur: string
  beneficiaires: string
  coFinanceurs: string
  pieceJointe?: Readonly<{
    apercu: string
    emplacement: string
    nom: string
    upload: Date
  }>
  actions: ReadonlyArray<ActionViewModel>
  wordingDetailDuBudget: string
  nombreDActionsAttachees: string
  totaux: Readonly<{
    budget: string
    coFinancement: string
    financementAccorde: string
  }>
}>

export type ActionViewModel = Readonly<{
  uid: string
  nom: string
  porteur?: string
  statut: Readonly<{
    icon: string
    libelle: string
    variant: StatutVariant
    iconStyle: string
  }>
  totaux: Readonly<{
    coFinancement: string
    financementAccorde: string
  }>
}>
