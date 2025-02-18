
import { formatPluriel } from './shared/text'
import { FeuillesDeRouteReadModel } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

export function feuillesDeRoutePresenter(
  feuillesDeRouteReadModel: FeuillesDeRouteReadModel
): FeuillesDeRouteViewModel {
  return {
    contratPreexistant: [
      {
        id: 'oui',
        label: 'Oui',
      },
      {
        id: 'non',
        label: 'Non',
      },
    ],
    feuillesDeRoute:
      feuillesDeRouteReadModel.feuillesDeRoute.map(toFeuilleDeRouteViewModel(feuillesDeRouteReadModel.uidGouvernance)),
    membres: [
      {
        label: 'Croix Rouge Française',
        uid: 'membre1FooId',
      },
      {
        label: 'La Poste',
        uid: 'membre2FooId',
      },
    ],
    perimetres: [
      {
        id: 'regional',
        label: 'Régional',
      },
      {
        id: 'departemental',
        label: 'Départemental',
      },
      {
        id: 'epci_groupement',
        label: 'EPCI ou groupement de communes',
      },
    ],
    titre: `Feuille${formatPluriel(feuillesDeRouteReadModel.feuillesDeRoute.length)} de route · ${feuillesDeRouteReadModel.departement}`,
    totaux: {
      budget: formatMontant(feuillesDeRouteReadModel.totaux.budget),
      coFinancement: formatMontant(feuillesDeRouteReadModel.totaux.coFinancement),
      financementAccorde: formatMontant(feuillesDeRouteReadModel.totaux.financementAccorde),
    },
    uidGouvernance: feuillesDeRouteReadModel.uidGouvernance,
  }
}

function toFeuilleDeRouteViewModel(uidGouvernance: string) {
  return (feuilleDeRoute: FeuillesDeRouteReadModel['feuillesDeRoute'][number]): FeuilleDeRouteViewModel => ({
    actions: feuilleDeRoute.actions.map(toActionViewModel(uidGouvernance, feuilleDeRoute.uid)),
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
  })
}

function toActionViewModel(uidGouvernance: string, uidFeuilleDeRoute: string) {
  return (action: FeuillesDeRouteReadModel['feuillesDeRoute'][number]['actions'][number]): ActionViewModel => ({
    beneficiaires: [
      {
        nom: 'Croix Rouge Française',
        url: '/',
      },
      {
        nom: 'La Poste',
        url: '/',
      },
    ],
    besoins: ['Établir un diagnostic territorial', 'Appui juridique dédié à la gouvernance'],
    budgetPrevisionnel: [
      {
        coFinanceur: 'Budget prévisionnel 2024',
        montant: '20 000 €',
      },
      {
        coFinanceur: 'Subvention de prestation',
        montant: '10 000 €',
      },
      {
        coFinanceur: 'CC des Monts du Lyonnais',
        montant: '5 000 €',
      },
      {
        coFinanceur: 'Croix Rouge Française',
        montant: '5 000 €',
      },
    ],
    description: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
    lienPourModifier: `/gouvernance/${uidGouvernance}/feuille-de-route/${uidFeuilleDeRoute}/action/${action.uid}/modifier`,
    nom: action.nom,
    porteur: 'CC des Monts du Lyonnais',
    statut: actionStatutViewModelByStatut[action.statut],
    totaux: {
      coFinancement: formatMontant(action.totaux.coFinancement),
      financementAccorde: formatMontant(action.totaux.financementAccorde),
    },
    uid: action.uid,
  })
}

export type FeuillesDeRouteViewModel = Readonly<{
  contratPreexistant: ReadonlyArray<{
    id: 'oui' | 'non'
    label: string
  }>
  feuillesDeRoute: ReadonlyArray<FeuilleDeRouteViewModel>
  membres: ReadonlyArray<{
    label: string
    uid: string
  }>
  perimetres: ReadonlyArray<{
    id: 'regional' | 'departemental' | 'epci_groupement'
    label: string
  }>
  titre: string
  totaux: Readonly<{
    budget: string
    coFinancement: string
    financementAccorde: string
  }>
  uidGouvernance: string
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
  beneficiaires: ReadonlyArray<{
    nom: string
    url: string
  }>
  besoins: ReadonlyArray<string>
  budgetPrevisionnel: ReadonlyArray<{
    coFinanceur: string
    montant: string
  }>
  description: string
  lienPourModifier: string
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
  uid: string
}>

function formatMontant(montant: number): string {
  return `${montant.toLocaleString('fr-FR')} €`
}

const actionStatutViewModelByStatut: Record<FeuillesDeRouteReadModel['feuillesDeRoute'][number]['actions'][number]['statut'], ActionStatutViewModel> = {
  deposee: {
    icon: 'fr-icon-flashlight-line',
    iconStyle: 'pin-action--deposee',
    libelle: 'Demande déposée',
    variant: 'new',
  },
  enCours: {
    icon: 'fr-icon-user-add-line',
    iconStyle: 'pin-action--en-cours',
    libelle: 'Instruction en cours',
    variant: 'info',
  },
  subventionAcceptee: {
    icon: 'fr-icon-flashlight-line',
    iconStyle: 'pin-action-acceptee',
    libelle: 'Subvention acceptée',
    variant: 'new',
  },
  subventionRefusee: {
    icon: 'fr-icon-flashlight-line',
    iconStyle: 'pin-action--refusee',
    libelle: 'Subvention refusée',
    variant: 'error',
  },
}

type ActionStatutViewModel = Readonly<{
  icon: string
  libelle: string
  variant: StatutVariant
  iconStyle: string
}>

type StatutVariant = 'success' | 'error' | 'info' | 'warning' | 'new'
