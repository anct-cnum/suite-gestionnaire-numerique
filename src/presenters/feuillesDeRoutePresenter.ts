import { ActionStatutViewModel, actionStatutViewModelByStatut } from './shared/action'
import { LabelValue } from './shared/labelValue'
import { formatMontant } from './shared/number'
import { formatPluriel } from './shared/text'
import { FeuillesDeRouteReadModel } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

export function feuillesDeRoutePresenter(readModel: FeuillesDeRouteReadModel): FeuillesDeRouteViewModel {
  return {
    feuillesDeRoute: readModel.feuillesDeRoute.map(toFeuilleDeRouteViewModel(readModel.uidGouvernance)),
    formulaire: {
      contratPreexistant: [
        {
          isSelected: false,
          label: 'Oui',
          value: 'oui',
        },
        {
          isSelected: false,
          label: 'Non',
          value: 'non',
        },
      ],
      membres: [
        {
          isSelected: true,
          label: 'Choisir',
          value: '',
        },
        {
          isSelected: false,
          label: 'Croix Rouge Française',
          value: 'membre1FooValue',
        },
        {
          isSelected: false,
          label: 'La Poste',
          value: 'membre2FooValue',
        },
      ],
      perimetres: [
        {
          isSelected: false,
          label: 'Régional',
          value: 'regional',
        },
        {
          isSelected: false,
          label: 'Départemental',
          value: 'departemental',
        },
        {
          isSelected: false,
          label: 'EPCI ou groupement de communes',
          value: 'epci_groupement',
        },
      ],
    },
    titre: `Feuille${formatPluriel(readModel.feuillesDeRoute.length)} de route`,
    totaux: {
      budget: formatMontant(readModel.totaux.budget),
      coFinancement: formatMontant(readModel.totaux.coFinancement),
      financementAccorde: formatMontant(readModel.totaux.financementAccorde),
    },
  }
}

function toFeuilleDeRouteViewModel(uidGouvernance: string) {
  return (feuilleDeRoute: FeuillesDeRouteReadModel['feuillesDeRoute'][number]): FeuilleDeRouteViewModel => ({
    actions: feuilleDeRoute.actions.map(toActionViewModel(uidGouvernance, feuilleDeRoute.uid)),
    links: {
      detail: `/gouvernance/${uidGouvernance}/feuille-de-route/${feuilleDeRoute.uid}`,
    },
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
    wordingNombreCofinanceursEtBeneficiaires: `${feuilleDeRoute.beneficiaires} bénéficiaire${formatPluriel(feuilleDeRoute.beneficiaires)}, ${feuilleDeRoute.coFinanceurs} co-financeur${formatPluriel(feuilleDeRoute.coFinanceurs)}`,
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
    description: '<p><strong>Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.</strong></p>',
    lienPourModifier: `/gouvernance/${uidGouvernance}/feuille-de-route/${uidFeuilleDeRoute}/action/${action.uid}/modifier`,
    nom: action.nom,
    porteur: 'CC des Monts du Lyonnais',
    statut: actionStatutViewModelByStatut[action.subvention?.statut ?? 'nonSubventionnee'],
    uid: action.uid,
  })
}

export type FeuillesDeRouteViewModel = Readonly<{
  feuillesDeRoute: ReadonlyArray<FeuilleDeRouteViewModel>
  formulaire: Readonly<{
    contratPreexistant: ReadonlyArray<LabelValue<'oui' | 'non'>>
    membres: ReadonlyArray<LabelValue>
    perimetres: ReadonlyArray<LabelValue<'regional' | 'departemental' | 'epci_groupement'>>
  }>
  titre: string
  totaux: Readonly<{
    budget: string
    coFinancement: string
    financementAccorde: string
  }>
}>

export type FeuilleDeRouteViewModel = Readonly<{
  nom: string
  uid: string
  porteur: string
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
  links: Readonly<{
    detail: string
  }>
  wordingNombreCofinanceursEtBeneficiaires: string
}>

type ActionViewModel = Readonly<{
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
  statut: ActionStatutViewModel
  uid: string
}>
