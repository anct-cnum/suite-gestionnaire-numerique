import { ActionStatutViewModel, actionStatutViewModelByStatut } from './shared/action'
import { BESOINS_LABELS } from './shared/besoins'
import { formaterEnDateFrancaise } from './shared/date'
import { HyperLink, LabelValue } from './shared/labels'
import { documentfeuilleDeRouteLink, feuilleDeRouteLink, membreLink } from './shared/link'
import { formaterPoidsDeFichier, formatMontant } from './shared/number'
import { formatPluriel } from './shared/text'
import { FeuillesDeRouteReadModel } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'
import { BesoinsPossible } from '@/use-cases/queries/shared/ActionReadModel'

export function feuillesDeRoutePresenter(readModel: FeuillesDeRouteReadModel): FeuillesDeRouteViewModel {
  return {
    feuillesDeRoute: readModel.feuillesDeRoute.map(toFeuilleDeRouteViewModel(readModel.uidGouvernance)),
    formulaire: {
      membres: [
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
          value: 'groupementsDeCommunes',
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

export type FeuillesDeRouteViewModel = Readonly<{
  feuillesDeRoute: ReadonlyArray<FeuilleDeRouteViewModel>
  formulaire: Readonly<{
    membres: ReadonlyArray<LabelValue>
    perimetres: ReadonlyArray<LabelValue<'departemental' | 'groupementsDeCommunes' | 'regional'>>
  }>
  titre: string
  totaux: Readonly<{
    budget: string
    coFinancement: string
    financementAccorde: string
  }>
}>

export type FeuilleDeRouteViewModel = Readonly<{
  actions: ReadonlyArray<ActionViewModel>
  links: Readonly<{
    ajouter: string
    detail: string
  }>
  nom: string
  nombreDActionsAttachees: string
  pieceJointe?: Readonly<{
    // Format et poids du lien de téléchargement : « PDF – 1,6 Mo », ou « PDF » seul si le poids est inconnu
    detail: string
    href: string
    metadonnee: string
    nom: string
    source: string
  }>
  porteur?: HyperLink
  totaux: Readonly<{
    budget: string
    coFinancement: string
    financementAccorde: string
  }>
  uid: string
  wordingDetailDuBudget: string
  wordingNombreCofinanceursEtBeneficiaires: string
}>

function toFeuilleDeRouteViewModel(uidGouvernance: string) {
  return (feuilleDeRoute: FeuillesDeRouteReadModel['feuillesDeRoute'][number]): FeuilleDeRouteViewModel => {
    return {
      actions: feuilleDeRoute.actions.map(toActionViewModel(uidGouvernance, feuilleDeRoute.uid)),
      links: {
        ajouter: `${feuilleDeRouteLink(uidGouvernance, feuilleDeRoute.uid)}/action/ajouter`,
        detail: feuilleDeRouteLink(uidGouvernance, feuilleDeRoute.uid),
      },
      nom: feuilleDeRoute.nom,
      nombreDActionsAttachees: `${feuilleDeRoute.actions.length} action${formatPluriel(feuilleDeRoute.actions.length)} attachée${formatPluriel(feuilleDeRoute.actions.length)} à cette feuille de route`,
      pieceJointe: feuilleDeRoute.pieceJointe && toPieceJointeViewModel(feuilleDeRoute.pieceJointe, feuilleDeRoute),
      porteur: feuilleDeRoute.structureCoPorteuse
        ? {
            label: feuilleDeRoute.structureCoPorteuse.nom,
            link: membreLink(feuilleDeRoute.structureCoPorteuse.structureId),
          }
        : undefined,
      totaux: {
        budget: formatMontant(feuilleDeRoute.totaux.budget),
        coFinancement: formatMontant(feuilleDeRoute.totaux.coFinancement),
        financementAccorde: formatMontant(feuilleDeRoute.totaux.financementAccorde),
      },
      uid: feuilleDeRoute.uid,
      wordingDetailDuBudget: `dont ${formatMontant(feuilleDeRoute.totaux.coFinancement)} de co-financements et ${formatMontant(feuilleDeRoute.totaux.financementAccorde)} des financements accordés`,
      wordingNombreCofinanceursEtBeneficiaires: `${feuilleDeRoute.beneficiaires} bénéficiaire${formatPluriel(feuilleDeRoute.beneficiaires)}, ${feuilleDeRoute.coFinanceurs} co-financeur${formatPluriel(feuilleDeRoute.coFinanceurs)}`,
    }
  }
}

function toPieceJointeViewModel(
  { chemin, nom, poids, upload }: NonNullable<FeuilleDeRouteReadModel['pieceJointe']>,
  { structureCoPorteuse }: FeuilleDeRouteReadModel
): NonNullable<FeuilleDeRouteViewModel['pieceJointe']> {
  const format = formatDuFichier(nom)
  const date = formaterEnDateFrancaise(upload)
  return {
    detail: poids === undefined ? format : `${format} – ${formaterPoidsDeFichier(poids)}`,
    href: documentfeuilleDeRouteLink(chemin),
    metadonnee: `Le ${date}.`,
    nom,
    // L'auteur du dépôt n'est pas la source : l'ANCT dépose parfois pour le territoire. On cite donc la structure
    // porteuse de la feuille de route
    source: `Document fourni par ${structureCoPorteuse?.nom ?? 'le territoire'}, mis en ligne le ${date}.`,
  }
}

// Format déduit de l'extension du fichier déposé ; le dépôt n'accepte que des PDF, d'où le repli
function formatDuFichier(nom: string): string {
  return /\.([a-z0-9]+)$/i.exec(nom)?.[1].toUpperCase() ?? 'PDF'
}

function toActionViewModel(uidGouvernance: string, uidFeuilleDeRoute: string) {
  return (action: FeuillesDeRouteReadModel['feuillesDeRoute'][number]['actions'][number]): ActionViewModel => ({
    beneficiaires: action.beneficiaires.map(({ nom, structureId }) => ({
      label: nom,
      link: membreLink(structureId),
    })),
    besoins: action.besoins.reduce(
      (acc, besoin) => ({
        ...acc,
        [besoin]: BESOINS_LABELS[besoin],
      }),
      {} as Record<BesoinsPossible, string>
    ),
    budgetPrevisionnel: {
      coFinancements: action.coFinancements.map(({ coFinanceur, montant }) => ({
        libelle: coFinanceur.nom,
        montant: formatMontant(montant),
      })),
      global: {
        libelle: 'Budget prévisionnel',
        montant: formatMontant(action.budgetGlobal),
      },
      subventions: action.subvention
        ? [
            {
              libelle: 'Prestation de service',
              montant: formatMontant(action.subvention.montants.prestation),
            },
            {
              libelle: 'Ressources humaine',
              montant: formatMontant(action.subvention.montants.ressourcesHumaines),
            },
          ]
        : [],
    },
    description: action.description,
    libelleEnveloppe: action.subvention?.enveloppe ?? 'Aucune enveloppe',
    libellePorteurs: formatlibellePorteurs(action.porteurs),
    lienPourModifier: `${feuilleDeRouteLink(uidGouvernance, uidFeuilleDeRoute)}/action/${action.uid}/modifier`,
    nom: action.nom,
    porteurs: action.porteurs.map(({ nom, structureId }) => ({
      label: nom,
      link: membreLink(structureId),
    })),
    statut: actionStatutViewModelByStatut[action.subvention?.statut ?? 'nonSubventionnee'],
    uid: action.uid,
  })
}

type ActionViewModel = Readonly<{
  beneficiaires: ReadonlyArray<HyperLink>
  besoins: Record<BesoinsPossible, string>
  budgetPrevisionnel: Readonly<{
    coFinancements: ReadonlyArray<Financement>
    global: Financement
    subventions: ReadonlyArray<Financement>
  }>
  description: string
  libelleEnveloppe: string
  libellePorteurs: string
  lienPourModifier: string
  nom: string
  porteurs: ReadonlyArray<HyperLink>
  statut: ActionStatutViewModel
  uid: string
}>

type Financement = Readonly<{
  libelle: string
  montant: string
}>

type FeuilleDeRouteReadModel = FeuillesDeRouteReadModel['feuillesDeRoute'][number]

function formatlibellePorteurs(
  porteurs: ReadonlyArray<{
    nom: string
    uid: string
  }>
): string {
  if (porteurs.length === 1 || porteurs.length === 0) {
    return 'Porteur de l’action'
  }
  return 'Porteurs de l’action'
}
