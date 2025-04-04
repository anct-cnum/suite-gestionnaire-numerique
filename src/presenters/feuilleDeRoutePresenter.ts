import { ActionStatutViewModel, actionStatutViewModelByStatut } from './shared/action'
import { formaterEnDateFrancaise } from './shared/date'
import { HistoriqueViewModel } from './shared/historique'
import { HyperLink, LabelValue } from './shared/labels'
import { documentfeuilleDeRouteLink, feuilleDeRouteLink, membreLink } from './shared/link'
import { formatMontant } from './shared/number'
import { formatPluriel } from './shared/text'
import { UneFeuilleDeRouteReadModel } from '@/use-cases/queries/RecupererUneFeuilleDeRoute'

export function feuilleDeRoutePresenter(readModel: UneFeuilleDeRouteReadModel): FeuilleDeRouteViewModel {
  return {
    action: `${readModel.actions.length} action${formatPluriel(readModel.actions.length)} pour cette feuille de route`,
    actions: readModel.actions.map(toActionViewModel(readModel.uidGouvernance, readModel.uid)),
    budgets: {
      cofinancement: formatMontant(readModel.montantCofinancements),
      etat: formatMontant(readModel.montantFinancementsAccordes),
      total: formatMontant(readModel.budgetTotalActions),
    },
    contextualisation: readModel.contextualisation,
    document: readModel.document && {
      href: documentfeuilleDeRouteLink(readModel.document.chemin),
      nom: readModel.document.nom,
    },
    formulaire: {
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
    infosActions: `${readModel.actions.length} action${formatPluriel(readModel.actions.length)}, ${readModel.beneficiaire} bénéficiaire${formatPluriel(readModel.beneficiaire)}, ${readModel.coFinanceur} co-financeur${formatPluriel(readModel.coFinanceur)}`,
    infosDerniereEdition: `Modifiée le ${formaterEnDateFrancaise(readModel.edition.date)} par ${readModel.edition.prenom} ${readModel.edition.nom}`,
    nom: readModel.nom,
    perimetre: readModel.perimetre,
    porteur: readModel.porteur ? {
      label: readModel.porteur.nom,
      link: membreLink(readModel.uidGouvernance, readModel.porteur.uid),
    } : undefined,
    uidFeuilleDeRoute: readModel.uid,
    uidGouvernance: readModel.uidGouvernance,
    urlAjouterUneAction: `${feuilleDeRouteLink(readModel.uidGouvernance, readModel.uid)}/action/ajouter`,
  }
}

export type FeuilleDeRouteViewModel = Readonly<{
  action: string
  actions: ReadonlyArray<{
    besoins: string
    budgetPrevisionnel: Readonly<{
      coFinancement: string
      coFinanceur: string
      enveloppe: string
      montant: string
      total: string
    }>
    icone: ActionStatutViewModel
    nom: string
    porteurs: ReadonlyArray<HyperLink>
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
  document?: Readonly<{
    href: string
    nom: string
  }>
  formulaire: Readonly<{
    membres: ReadonlyArray<LabelValue>
    perimetres: ReadonlyArray<LabelValue<'departemental' | 'epci_groupement' | 'regional'>>
  }>
  historiques: ReadonlyArray<HistoriqueViewModel>
  infosActions: string
  infosDerniereEdition: string
  nom: string
  perimetre: string
  porteur?: HyperLink
  uidFeuilleDeRoute: string
  uidGouvernance: string
  urlAjouterUneAction: string
}>

function toActionViewModel(uidGouvernance: string, uidFeuilleDeRoute: string) {
  return (action: UneFeuilleDeRouteReadModel['actions'][number]): FeuilleDeRouteViewModel['actions'][number] => {
    // istanbul ignore next @preserve
    const icone = action.isEnveloppeFormation ?
      actionStatutViewModelByStatut.enCours : actionStatutViewModelByStatut.acceptee

    return {
      besoins: `${action.besoins.join(', ') || '-'}, ${action.beneficiaire} bénéficiaire${formatPluriel(action.beneficiaire)}`,
      budgetPrevisionnel: {
        coFinancement: formatMontant(action.coFinancement.montant),
        coFinanceur: `${action.coFinancement.financeur} co-financeur${formatPluriel(action.coFinancement.financeur)}`,
        enveloppe: action.enveloppe.libelle,
        montant: formatMontant(action.enveloppe.montant),
        total: formatMontant(action.budgetPrevisionnel),
      },
      icone,
      nom: action.nom,
      porteurs: action.porteurs.map((porteur) => ({
        label: porteur.nom,
        link: membreLink(uidGouvernance, porteur.uid),
      })),
      statut: actionStatutViewModelByStatut[action.statut],
      uid: action.uid,
      urlModifier: `${feuilleDeRouteLink(uidGouvernance, uidFeuilleDeRoute)}/action/${action.uid}/modifier`,
    }
  }
}
