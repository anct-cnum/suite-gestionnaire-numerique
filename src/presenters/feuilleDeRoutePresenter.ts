import { ActionStatutViewModel, actionStatutViewModelByStatut } from './shared/action'
import { LabelValue } from './shared/labelValue'
import { formatMontant } from './shared/number'

export function feuilleDeRoutePresenter(codeDepartement: string, uidFeuilleDeRoute: string): FeuilleDeRouteViewModel {
  return {
    actions: [
      {
        budgetPrevisionnel: {
          coFinanceur: formatMontant(80_000),
          montant: formatMontant(20_000),
          total: formatMontant(100_000),
        },
        nom: 'Structurer une filière de reconditionnement locale',
        perimetre: 'Établir un diagnostic territorial, 2 bénéficiaires',
        porteur: 'CC des Monts du Lyonnais',
        statut: actionStatutViewModelByStatut.subventionAcceptee,
        uid: 'actionFooId1',
        urlModifier: `/gouvernance/${codeDepartement}/feuille-de-route/${uidFeuilleDeRoute}/action/actionFooId1/modifier`,
      },
      {
        budgetPrevisionnel: {
          coFinanceur: formatMontant(0),
          montant: formatMontant(20_000),
          total: formatMontant(20_000),
        },
        nom: 'Formation Aidants Connect',
        perimetre: 'Établir un diagnostic territorial, 2 bénéficiaires',
        porteur: 'CC des Monts du Lyonnais',
        statut: actionStatutViewModelByStatut.subventionRefusee,
        uid: 'actionFooId2',
        urlModifier: `/gouvernance/${codeDepartement}/feuille-de-route/${uidFeuilleDeRoute}/action/actionFooId2/modifier`,
      },
    ],
    budgets: {
      cofinancement: formatMontant(90_000),
      etat: formatMontant(30_000),
      total: formatMontant(140_000),
    },
    contextualisation: '<p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p>',
    contratPreexistant: false,
    formulaire: {
      contratPreexistant: [
        {
          id: 'oui',
          isChecked: false,
          label: 'Oui',
        },
        {
          id: 'non',
          isChecked: true,
          label: 'Non',
        },
      ],
      membres: [
        {
          isSelected: false,
          label: 'Croix Rouge Française',
          value: 'membre1FooId',
        },
        {
          isSelected: true,
          label: 'La Poste',
          value: 'membre2FooId',
        },
      ],
      perimetres: [
        {
          id: 'regional',
          isChecked: false,
          label: 'Régional',
        },
        {
          id: 'departemental',
          isChecked: true,
          label: 'Départemental',
        },
        {
          id: 'epci_groupement',
          isChecked: false,
          label: 'EPCI ou groupement de communes',
        },
      ],
    },
    historiques: [
      {
        activite: 'Versement effectué',
        date: '12/02/2024',
        editeur: 'Par Banque des territoires',
      },
      {
        activite: 'Demande acceptée',
        date: '08/02/2024',
        editeur: 'Par ANCT',
      },
      {
        activite: 'Action Structurer un fonds local pour l’inclusion numérique',
        date: '15/01/2024',
        editeur: 'Par Lucie B',
      },
    ],
    infosActions: '3 actions, 5 bénéficiaires, 3 co-financeurs',
    infosDerniereEdition: 'Modifiée le 23/11/2024 par Lucie Brunot',
    nom: 'Feuille de route FNE',
    perimetre: 'Périmètre départemental',
    porteur: 'Orange',
    uidFeuilleDeRoute: 'feuilleDeRouteFooId',
    uidGouvernance: 'gouvernanceFooId',
    urlAjouterUneAction: `/gouvernance/${codeDepartement}/feuille-de-route/${uidFeuilleDeRoute}/action/ajouter`,
  }
}

export type FeuilleDeRouteViewModel = Readonly<{
  actions: ReadonlyArray<{
    budgetPrevisionnel: Readonly<{
      coFinanceur: string
      montant: string
      total: string
    }>
    nom: string
    perimetre: string
    porteur: string
    statut: ActionStatutViewModel
    uid: string
    urlModifier: string
  }>
  budgets: Readonly<{
    cofinancement: string
    etat: string
    total: string
  }>
  contextualisation: string
  contratPreexistant: boolean
  formulaire: Readonly<{
    contratPreexistant: ReadonlyArray<{
      id: 'oui' | 'non'
      isChecked: boolean
      label: string
    }>
    membres: ReadonlyArray<LabelValue>
    perimetres: ReadonlyArray<{
      id: 'regional' | 'departemental' | 'epci_groupement'
      isChecked: boolean
      label: string
    }>
  }>
  historiques: ReadonlyArray<{
    activite: string
    date: string
    editeur: string
  }>
  infosActions: string
  infosDerniereEdition: string
  nom: string
  perimetre: string
  porteur: string
  uidFeuilleDeRoute: string
  uidGouvernance: string
  urlAjouterUneAction: string
}>
