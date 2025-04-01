import { ActionStatutViewModel, actionStatutViewModelByStatut } from './shared/action'
import { HistoriqueViewModel } from './shared/historique'
import { HyperLink, LabelValue } from './shared/labels'
import { feuilleDeRouteLink, membreLink } from './shared/link'
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
        porteur: {
          label: 'CC des Monts du Lyonnais',
          link: membreLink(codeDepartement, 'membreFooId'),
        },
        statut: actionStatutViewModelByStatut.acceptee,
        uid: 'actionFooId1',
        urlModifier: `${feuilleDeRouteLink(codeDepartement, uidFeuilleDeRoute)}/action/actionFooId1/modifier`,
      },
      {
        budgetPrevisionnel: {
          coFinanceur: formatMontant(0),
          montant: formatMontant(20_000),
          total: formatMontant(20_000),
        },
        nom: 'Formation Aidants Connect',
        perimetre: 'Établir un diagnostic territorial, 2 bénéficiaires',
        porteur: {
          label: 'CC des Monts du Lyonnais',
          link: membreLink(codeDepartement, 'membreFooId'),
        },
        statut: actionStatutViewModelByStatut.refusee,
        uid: 'actionFooId2',
        urlModifier: `${feuilleDeRouteLink(codeDepartement, uidFeuilleDeRoute)}/action/actionFooId2/modifier`,
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
          isSelected: false,
          label: 'Oui',
          value: 'oui',
        },
        {
          isSelected: true,
          label: 'Non',
          value: 'non',
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
          isSelected: false,
          label: 'Régional',
          value: 'regional',
        },
        {
          isSelected: true,
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
    historiques: [
      {
        date: '12/02/2024',
        editeur: 'Par Banque des territoires',
        libelle: 'Versement effectué',
      },
      {
        date: '08/02/2024',
        editeur: 'Par ANCT',
        libelle: 'Demande acceptée',
      },
      {
        date: '15/01/2024',
        editeur: 'Par Lucie B',
        libelle: 'Action Structurer un fonds local pour l’inclusion numérique',
      },
    ],
    infosActions: '3 actions, 5 bénéficiaires, 3 co-financeurs',
    infosDerniereEdition: 'Modifiée le 23/11/2024 par Lucie Brunot',
    nom: 'Feuille de route FNE',
    perimetre: 'Périmètre départemental',
    porteur: {
      label: 'Orange',
      link: membreLink(codeDepartement, 'membreFooId'),
    },
    uidFeuilleDeRoute: 'feuilleDeRouteFooId',
    uidGouvernance: 'gouvernanceFooId',
    urlAjouterUneAction: `${feuilleDeRouteLink(codeDepartement, uidFeuilleDeRoute)}/action/ajouter`,
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
    porteur: HyperLink
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
    contratPreexistant: ReadonlyArray<LabelValue<'non' | 'oui'>>
    membres: ReadonlyArray<LabelValue>
    perimetres: ReadonlyArray<LabelValue<'departemental' | 'epci_groupement' | 'regional'>>
  }>
  historiques: ReadonlyArray<HistoriqueViewModel>
  infosActions: string
  infosDerniereEdition: string
  nom: string
  perimetre: string
  porteur: HyperLink
  uidFeuilleDeRoute: string
  uidGouvernance: string
  urlAjouterUneAction: string
}>
