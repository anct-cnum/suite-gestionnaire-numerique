import { formatMontant } from './shared/number'
import { FeuillesDeRouteReadModel } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

export function actionPresenter(
  feuillesDeRouteReadModel: FeuillesDeRouteReadModel
): ActionViewModel {
  return {
    anneeDeDebut: '2025',
    anneeDeFin: undefined,
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
    lienPourModifier: `/gouvernance/${feuillesDeRouteReadModel.uidGouvernance}/feuille-de-route/uid-feuille/action/uid-action/modifier`,
    nom: 'Action test',
    porteur: 'CC des Monts du Lyonnais',
    statut: actionStatutViewModelByStatut.deposee,
    temporalite: 'annuelle',
    totaux: {
      coFinancement: formatMontant(20_000),
      financementAccorde: formatMontant(20_000),
    },
    uid: 'uid-action',
  }
}

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
  budgetGlobal: number
  description: string
  contexte: string
  lienPourModifier: string
  nom: string
  porteur?: string
  statut: Readonly<{
    background: 'purple' | 'green' | 'pink' | 'red' | 'white' | 'blue'
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
  temporalite: 'pluriannuelle' | 'annuelle'
  anneeDeDebut: string
  anneeDeFin?: string
}>

type StatutVariant = 'success' | 'error' | 'info' | 'warning' | 'new'

export const actionStatutViewModelByStatut: Record<FeuillesDeRouteReadModel['feuillesDeRoute'][number]['actions'][number]['statut'], ActionStatutViewModel> = {
  deposee: {
    background: 'purple',
    icon: 'flashlight-line',
    iconStyle: 'pin-action--deposee',
    libelle: 'Demande déposée',
    variant: 'new',
  },
  enCours: {
    background: 'green',
    icon: 'user-add-line',
    iconStyle: 'pin-action--en-cours',
    libelle: 'Instruction en cours',
    variant: 'info',
  },
  subventionAcceptee: {
    background: 'pink',
    icon: 'flashlight-line',
    iconStyle: 'pin-action-acceptee',
    libelle: 'Subvention acceptée',
    variant: 'new',
  },
  subventionRefusee: {
    background: 'red',
    icon: 'flashlight-line',
    iconStyle: 'pin-action--refusee',
    libelle: 'Subvention refusée',
    variant: 'error',
  },
}

type ActionStatutViewModel = Readonly<{
  background: 'purple' | 'green' | 'pink' | 'red' | 'white' | 'blue'
  icon: string
  libelle: string
  variant: StatutVariant
  iconStyle: string
}>

export const actionARemplir: ActionViewModel = {
  anneeDeDebut: '',
  anneeDeFin: '',
  beneficiaires: [],
  besoins: [],
  budgetGlobal: 0,
  budgetPrevisionnel: [],
  contexte: '',
  description: '',
  lienPourModifier: '',
  nom: '',
  porteur: '',
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
}
