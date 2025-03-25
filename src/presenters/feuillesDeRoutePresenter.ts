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
          label: 'Oui',
          value: 'oui',
        },
        {
          label: 'Non',
          value: 'non',
        },
      ],
      membres: [
        {
          label: 'Choisir',
          value: '',
        },
        ...readModel.porteursPotentielsNouvellesFeuillesDeRouteOuActions.map(({ nom, uid }) => ({
          label: nom,
          value: uid,
        })),
      ],
      perimetres: [
        {
          label: 'Régional',
          value: 'regional',
        },
        {
          label: 'Départemental',
          value: 'departemental',
        },
        {
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
    porteur: feuilleDeRoute.structureCoPorteuse?.nom,
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
    beneficiaires: action.beneficiaires.map(({ nom }) => ({ nom, url: '/' })),
    besoins: action.besoins,
    budgetPrevisionnel: {
      coFinancements: action.coFinancements.map(({ coFinanceur, montant }) => ({
        libelle: coFinanceur.nom,
        montant: formatMontant(montant),
      })),
      global: {
        libelle: 'Budget prévisionnel',
        montant: formatMontant(action.budgetGlobal),
      },
      subventions: action.subvention ? [
        {
          libelle: 'Subvention de prestation',
          montant: formatMontant(action.subvention.montants.prestation),
        },
        {
          libelle: 'Subvention en ressource humaines',
          montant: formatMontant(action.subvention.montants.ressourcesHumaines),
        },
      ] : [],
    },
    description: action.description,
    lienPourModifier: `/gouvernance/${uidGouvernance}/feuille-de-route/${uidFeuilleDeRoute}/action/${action.uid}/modifier`,
    nom: action.nom,
    porteurs: action.porteurs.map(({ nom, uid }) => ({ label: nom, value: uid })),
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
  porteur?: string
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
  budgetPrevisionnel: Readonly<{
    global: Financement
    subventions: ReadonlyArray<Financement>
    coFinancements: ReadonlyArray<Financement>
  }>
  description: string
  lienPourModifier: string
  nom: string
  porteurs: ReadonlyArray<LabelValue>
  statut: ActionStatutViewModel
  uid: string
}>

type Financement = Readonly<{
  libelle: string
  montant: string
}>
