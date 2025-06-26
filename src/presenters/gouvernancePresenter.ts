import { formaterEnDateFrancaise, formatForInputDate } from './shared/date'
import { HyperLink } from './shared/labels'
import { documentfeuilleDeRouteLink, feuilleDeRouteLink, membreLink } from './shared/link'
import { formaterEnNombreFrancais, formatMontant } from './shared/number'
import { PorteurPotentielViewModel } from './shared/PorteurPotentiel'
import { RoleViewModel, toRoleViewModel } from './shared/role'
import { formatPluriel } from './shared/text'
import { isNullishOrEmpty } from '@/shared/lang'
import { ComiteReadModel, CoporteurDetailReadModel, FeuilleDeRouteReadModel, MembreReadModel, UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'

export function gouvernancePresenter(
  gouvernanceReadModel: UneGouvernanceReadModel,
  now: Date
): GouvernanceViewModel {
  return {
    ...{ comites: gouvernanceReadModel.comites?.map((comite) => toComitesViewModel(comite, now)) },
    comiteARemplir,
    dateAujourdhui: formatForInputDate(now),
    departement: gouvernanceReadModel.departement,
    links: {
      membres: `/gouvernance/${gouvernanceReadModel.uid}/membres`,
    },
    notePrivee: toNotePriveeViewModel(gouvernanceReadModel.notePrivee),
    peutVoirNotePrivee: gouvernanceReadModel.peutVoirNotePrivee,
    porteursPotentielsNouvellesFeuillesDeRouteOuActions:
      gouvernanceReadModel
        .porteursPotentielsNouvellesFeuillesDeRouteOuActions
        .map(porteur => ({
          id: porteur.uid,
          link: membreLink(gouvernanceReadModel.uid, porteur.uid),
          nom: porteur.nom,
          roles: porteur.roles.map( role=> toRoleViewModel(role)),
          type:  porteur.type,
        } as PorteurPotentielViewModel)),
    sectionFeuillesDeRoute: {
      ...buildTitresFeuillesDeRoute(gouvernanceReadModel),
      ...{
        feuillesDeRoute:
          gouvernanceReadModel.feuillesDeRoute.map(toFeuillesDeRouteViewModel(gouvernanceReadModel.uid)),
      },
    },
    sectionMembres: {
      ...{
        coporteurs:
          gouvernanceReadModel.syntheseMembres.coporteurs.map(toCoporteursDetailsViewModel(gouvernanceReadModel.uid)),
      },
      lien: `/gouvernance/${gouvernanceReadModel.uid}/membres`,
      totalEtWording: [
        gouvernanceReadModel.syntheseMembres.total,
        `membre${formatPluriel(gouvernanceReadModel.syntheseMembres.total)}`,
      ],
      wordingRecap: wordingMembres(gouvernanceReadModel.syntheseMembres),
    },
    sectionNoteDeContexte: {
      ...{ noteDeContexte: toNoteDeContexteViewModel(gouvernanceReadModel.noteDeContexte) },
      sousTitre: buildSousTitreNoteDeContexte(gouvernanceReadModel.noteDeContexte),
    },
    uid: gouvernanceReadModel.uid,
  }
}

export type GouvernanceViewModel = Readonly<{
  comiteARemplir: ComiteViewModel
  comites?: ReadonlyArray<ComiteResumeViewModel>
  dateAujourdhui: string
  departement: string
  links: {
    membres: string
  }
  notePrivee?: Readonly<{
    edition: string
    resume: string
    texte: string
  }>
  peutVoirNotePrivee: boolean
  porteursPotentielsNouvellesFeuillesDeRouteOuActions: ReadonlyArray<PorteurPotentielViewModel>
  sectionFeuillesDeRoute: Readonly<{
    budgetTotalCumule: string
    feuillesDeRoute: ReadonlyArray<FeuilleDeRouteViewModel>
    lien: Readonly<{
      label: string
      url: string
    }>
    total: string
    wording: string
  }>
  sectionMembres: Readonly<{
    coporteurs: ReadonlyArray<MembreDetailsViewModel>
    lien: string
    totalEtWording: Readonly<[number, string]>
    wordingRecap: string
  }>
  sectionNoteDeContexte: Readonly<{
    noteDeContexte?: Readonly<{
      dateDeModification: string
      nomAuteur: string
      prenomAuteur: string
      texteAvecHTML: string
    }>
    sousTitre: string
  }>
  uid: string
}>

export type ComiteViewModel = Readonly<{
  commentaire?: string
  date?: string
  derniereEdition?: string
  editeur?: string
  frequences: ReadonlyArray<{
    id: string
    isChecked: boolean
    label: string
    value: string
  }>
  types: ReadonlyArray<{
    id: string
    isChecked: boolean
    label: string
    value: string
  }>
  uid: number
}>

export type MembreDetailsViewModel = Readonly<{
  details: ReadonlyArray<
    Readonly<{
      feuillesDeRoute?: ReadonlyArray<HyperLink>
      information: string
      intitule: string
    }>
  >
  logo: string
  nom: string
  plusDetailsHref?: string
  roles: ReadonlyArray<RoleViewModel>
  type: string
}>

type FeuilleDeRouteViewModel = Readonly<{
  beneficiairesSubvention: ReadonlyArray<HyperLink>
  beneficiairesSubventionAccordee: ReadonlyArray<HyperLink>
  beneficiairesSubventionFormation: ReadonlyArray<HyperLink>
  beneficiairesSubventionFormationAccordee: ReadonlyArray<HyperLink>
  budgetGlobal: string
  budgetSubventionDemandee: number
  lien: string
  montantSubventionAccordee: string
  montantSubventionDemandee: string
  montantSubventionFormationAccordee: string
  nom: string
  pieceJointe?: Readonly<{
    apercu: string
    emplacement: string
    href: string
    metadonnee: string
    nom: string
  }>
  porteur?: HyperLink
  totalActions: string
  wordingBeneficiairesSubvention: string
  wordingBeneficiairesSubventionAccordee: string
  wordingBeneficiairesSubventionFormation: string
  wordingBeneficiairesSubventionFormationAccordee: string
}>

function toComitesViewModel(comite: ComiteReadModel, now: Date): ComiteResumeViewModel {
  const date = comite.date !== undefined && comite.date >= now
    ? ` : ${formaterEnDateFrancaise(new Date(comite.date))}`
    : ''
  const frequence: Record<string, string> = {
    annuelle: 'Annuel',
    mensuelle: 'Mensuel',
    semestrielle: 'Semestriel',
    trimestrielle: 'Trimestriel',
  }

  return {
    commentaire: comite.commentaire,
    date: comite.date === undefined ? undefined : formatForInputDate(comite.date),
    derniereEdition: formaterEnDateFrancaise(comite.derniereEdition),
    editeur: `${comite.prenomEditeur} ${comite.nomEditeur}`,
    frequence: frequence[comite.frequence],
    frequences: frequences.map((frequence) => {
      return {
        id: `${frequence.id}_modifier`,
        isChecked: comite.frequence === frequence.value,
        label: frequence.label,
        value: frequence.value,
      }
    }),
    intitule: `Comité ${comite.type}${date}`,
    types: types.map((type) => {
      return {
        id: `${type.id}_modifier`,
        isChecked: comite.type === type.value,
        label: type.label,
        value: type.value,
      }
    }),
    uid: comite.id,
  }
}

function toFeuillesDeRouteViewModel(uidGouvernance: string) {
  return (feuilleDeRoute: FeuilleDeRouteReadModel): FeuilleDeRouteViewModel => {
    const nombreDeBeneficiairesSubvention = feuilleDeRoute.beneficiairesSubvention.length
    const nombreDeBeneficiairesSubventionAccordee = feuilleDeRoute.beneficiairesSubventionAccordee.length
    const nombreDeBeneficiairesSubventionFormation = feuilleDeRoute.beneficiairesSubventionFormation.length
    const nombreDeBeneficiairesSubventionFormationAccordee =
            feuilleDeRoute.beneficiairesSubventionFormationAccordee.length
    const tailleDocument = feuilleDeRoute.pieceJointe?.metadonnees?.taille
    const formatDocument = feuilleDeRoute.pieceJointe?.metadonnees?.format
    return {
      beneficiairesSubvention: feuilleDeRoute.beneficiairesSubvention.map(toMembresViewModel(uidGouvernance)),
      beneficiairesSubventionAccordee:
             feuilleDeRoute.beneficiairesSubventionAccordee.map(toMembresViewModel(uidGouvernance)),
      beneficiairesSubventionFormation:
        feuilleDeRoute.beneficiairesSubventionFormation.map(toMembresViewModel(uidGouvernance)),
      beneficiairesSubventionFormationAccordee:
        feuilleDeRoute.beneficiairesSubventionFormationAccordee.map(toMembresViewModel(uidGouvernance)),
      budgetGlobal: formatMontant(feuilleDeRoute.budgetGlobal),
      budgetSubventionDemandee: feuilleDeRoute.montantSubventionDemandee,
      lien: feuilleDeRouteLink(uidGouvernance, feuilleDeRoute.uid),
      montantSubventionAccordee: formatMontant(feuilleDeRoute.montantSubventionAccordee),
      montantSubventionDemandee: formatMontant(feuilleDeRoute.montantSubventionDemandee),
      montantSubventionFormationAccordee: formaterEnNombreFrancais(feuilleDeRoute.montantSubventionFormationAccordee),
      nom: feuilleDeRoute.nom,
      pieceJointe: feuilleDeRoute.pieceJointe && {
        ...feuilleDeRoute.pieceJointe,
        href: documentfeuilleDeRouteLink(feuilleDeRoute.pieceJointe.nom),
        metadonnee: feuilleDeRoute.pieceJointe.metadonnees ?
          `Le ${formaterEnDateFrancaise(feuilleDeRoute.pieceJointe.metadonnees.upload)}, ${tailleDocument}, ${formatDocument}.` : '',
      },
      porteur: feuilleDeRoute.porteur ? {
        label: feuilleDeRoute.porteur.nom,
        link: membreLink(uidGouvernance, feuilleDeRoute.porteur.uid),
      } : undefined,
      totalActions: `${feuilleDeRoute.totalActions} action${formatPluriel(feuilleDeRoute.totalActions)}`,
      wordingBeneficiairesSubvention: `Bénéficiaire${formatPluriel(nombreDeBeneficiairesSubvention)}`,
      wordingBeneficiairesSubventionAccordee: `Bénéficiaire${formatPluriel(nombreDeBeneficiairesSubventionAccordee)}`,
      wordingBeneficiairesSubventionFormation: `Bénéficiaire${formatPluriel(nombreDeBeneficiairesSubventionFormation)}`,
      wordingBeneficiairesSubventionFormationAccordee: `Bénéficiaire${formatPluriel(nombreDeBeneficiairesSubventionFormationAccordee)}`,
    }
  }
}

function toMembresViewModel(uidGouvernance: string) {
  return (membre: MembreReadModel): HyperLink => ({
    label: membre.nom,
    link: membreLink(uidGouvernance, membre.uid),
  })
}

function toCoporteursDetailsViewModel(uidGouvernance: string) {
  return (coporteur: CoporteurDetailReadModel): MembreDetailsViewModel => {
    const contactReferent = `${coporteur.contactReferent.prenom} ${coporteur.contactReferent.nom}, ${coporteur.contactReferent.poste} ${coporteur.contactReferent.mailContact}`

    const detailsAffichage: MembreDetailsViewModel['details'] = [
      ...coporteur.contactReferent.denomination === 'Contact politique de la collectivité' ? [{ information: contactReferent, intitule: coporteur.contactReferent.denomination }] : [],

      ...isNullishOrEmpty(coporteur.contactTechnique)
        ? []
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        : [{ information: coporteur.contactTechnique!, intitule: 'Contact technique' }],
      ...isNaN(coporteur.totalMontantsSubventionsAccordees ?? NaN) ? [] : [
        {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          information: `${formaterEnNombreFrancais(coporteur.totalMontantsSubventionsAccordees!)} €`,
          intitule: 'Total subventions accordées',
        },
      ],
      ...isNaN(coporteur.totalMontantsSubventionsFormationAccordees ?? NaN) ? [] : [
        {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          information: `${formaterEnNombreFrancais(coporteur.totalMontantsSubventionsFormationAccordees!)} €`,
          intitule: 'Total subventions formations accordées',
        },
      ],
      ...coporteur.contactReferent.denomination === 'Contact référent' ? [{ information: contactReferent, intitule: 'Contact référent' }] : [],
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        information: isNullishOrEmpty(coporteur.telephone) ? '-' : coporteur.telephone!,
        intitule: 'Téléphone',
      },
    ]
    const details = detailsAffichage.slice()
    if (coporteur.feuillesDeRoute.length >= 1) {
      details.unshift(
        {
          feuillesDeRoute: coporteur.feuillesDeRoute.map((feuilleDeRoute) => ({
            label: feuilleDeRoute.nom,
            link: feuilleDeRouteLink(uidGouvernance, feuilleDeRoute.uid),
          })),
          information: '',
          intitule: `Feuille${formatPluriel(coporteur.feuillesDeRoute.length)} de route`,
        }
      )
    }

    return {
      details,
      logo: buildLogoMembre(coporteur.type),
      nom: coporteur.nom,
      plusDetailsHref: coporteur.links.plusDetails,
      roles: coporteur.roles.map(toRoleViewModel),
      type: coporteur.type,
    }
  }
}

function buildLogoMembre(type: string): string {
  // Stryker disable next-line all
  return type === 'Administration' ? 'bank-line' : 'community-line'
}

function toNoteDeContexteViewModel(noteDeContexte: UneGouvernanceReadModel['noteDeContexte']): GouvernanceViewModel['sectionNoteDeContexte']['noteDeContexte'] {
  if (!noteDeContexte) {
    return undefined
  }

  return {
    dateDeModification: formaterEnDateFrancaise(noteDeContexte.dateDeModification),
    nomAuteur: noteDeContexte.nomAuteur,
    prenomAuteur: noteDeContexte.prenomAuteur,
    texteAvecHTML: noteDeContexte.texte,
  }
}

function toNotePriveeViewModel(notePrivee: UneGouvernanceReadModel['notePrivee']): GouvernanceViewModel['notePrivee'] {
  if (!notePrivee) {
    return undefined
  }

  return {
    edition: `Modifié le ${formaterEnDateFrancaise(notePrivee.dateDEdition)} par ${notePrivee.prenomEditeur} ${notePrivee.nomEditeur}`,
    resume: `${notePrivee.texte.substring(0, 290)}...`,
    texte: notePrivee.texte,
  }
}

function wordingMembres(syntheseMembres: UneGouvernanceReadModel['syntheseMembres']): string {
  return [
    [syntheseMembres.coporteurs.length, 'co-porteur'] as const,
    [syntheseMembres.candidats, 'candidat'] as const,
  ]
    .map(([nombre, categorie]) => `${nombre} ${categorie}${formatPluriel(nombre)}`)
    .join(', ')
}

function buildTitresFeuillesDeRoute(gouvernance: UneGouvernanceReadModel): GouvernanceViewModel['sectionFeuillesDeRoute'] {
  if (gouvernance.feuillesDeRoute.length === 0) {
    return {
      budgetTotalCumule: '0',
      feuillesDeRoute: [],
      lien: {
        label: '',
        url: '/',
      },
      total: '0',
      wording: 'feuille de route',
    }
  }
  const url = `/gouvernance/${gouvernance.uid}/feuilles-de-route`
  const lien = gouvernance.feuillesDeRoute.length === 1 ? {
    label: 'Voir la feuille de route',
    url,
  } : {
    label: 'Voir les feuilles de route',
    url,
  }

  const nombreDeFeuillesDeRoute = gouvernance.feuillesDeRoute.length
  const budgetTotalCumule =
    gouvernance.feuillesDeRoute.reduce((budget, feuilleDeRoute) => budget + feuilleDeRoute.budgetGlobal, 0)

  return {
    budgetTotalCumule: formaterEnNombreFrancais(budgetTotalCumule),
    feuillesDeRoute: [],
    lien,
    total: String(nombreDeFeuillesDeRoute),
    wording: `feuille${formatPluriel(nombreDeFeuillesDeRoute)} de route`,
  }
}

function buildSousTitreNoteDeContexte(noteDeContexte: UneGouvernanceReadModel['noteDeContexte']): string {
  if (!noteDeContexte) {
    return ''
  }

  return `Modifié le ${formaterEnDateFrancaise(noteDeContexte.dateDeModification)} par ${noteDeContexte.prenomAuteur} ${noteDeContexte.nomAuteur}`
}

type ComiteResumeViewModel = ComiteViewModel & Readonly<{
  frequence: string
  intitule: string
}>

const frequences = [
  {
    id: 'mensuelle',
    isChecked: true,
    label: 'Mensuelle',
    value: 'mensuelle',
  },
  {
    id: 'trimestrielle',
    isChecked: false,
    label: 'Trimestrielle',
    value: 'trimestrielle',
  },
  {
    id: 'semestrielle',
    isChecked: false,
    label: 'Semestrielle',
    value: 'semestrielle',
  },
  {
    id: 'annuelle',
    isChecked: false,
    label: 'Annuelle',
    value: 'annuelle',
  },
]

const types = [
  {
    id: 'strategique',
    isChecked: true,
    label: 'Stratégique',
    value: 'strategique',
  },
  {
    id: 'technique',
    isChecked: false,
    label: 'Technique',
    value: 'technique',
  },
  {
    id: 'consultatif',
    isChecked: false,
    label: 'Consultatif',
    value: 'consultatif',
  },
  {
    id: 'autre',
    isChecked: false,
    label: 'Autre',
    value: 'autre',
  },
]

const comiteARemplir: ComiteViewModel = {
  frequences,
  types,
  uid: -1,
}
