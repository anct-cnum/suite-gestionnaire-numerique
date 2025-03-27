import { formaterEnDateFrancaise, formatForInputDate } from './shared/date'
import { formaterEnNombreFrancais, formatMontant } from './shared/number'
import { RoleViewModel, toRoleViewModel } from './shared/role'
import { formatPluriel } from './shared/text'
import { ComiteReadModel, FeuilleDeRouteReadModel, CoporteurDetailReadModel, MembreReadModel, UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'

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
    sectionFeuillesDeRoute: {
      ...buildTitresFeuillesDeRoute(gouvernanceReadModel),
      ...{
        feuillesDeRoute:
          gouvernanceReadModel.feuillesDeRoute.map(toFeuillesDeRouteViewModel(gouvernanceReadModel.uid)),
      },
    },
    sectionMembres: {
      ...{ coporteurs: gouvernanceReadModel.syntheseMembres.coporteurs.map(toCoporteursDetailsViewModel) },
      lien: '/gouvernance/11/membres',
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
  peutVoirNotePrivee: boolean
  comites?: ReadonlyArray<ComiteResumeViewModel>
  comiteARemplir: ComiteViewModel
  dateAujourdhui: string
  departement: string
  notePrivee?: Readonly<{
    edition: string
    resume: string
    texte: string
  }>
  sectionFeuillesDeRoute: Readonly<{
    budgetTotalCumule: string
    feuillesDeRoute: ReadonlyArray<FeuilleDeRouteViewModel>
    total: string
    wording: string
    lien: Readonly<{
      label: string
      url: string
    }>
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
  links: {
    membres: string
  }
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
    const nombreDeBeneficiairesSubventionFormation = feuilleDeRoute.beneficiairesSubventionFormation.length
    return {
      beneficiairesSubvention: feuilleDeRoute.beneficiairesSubvention.map(toMembresViewModel),
      beneficiairesSubventionFormation: feuilleDeRoute.beneficiairesSubventionFormation.map(toMembresViewModel),
      budgetGlobal: formatMontant(feuilleDeRoute.budgetGlobal),
      lien: `/gouvernance/${uidGouvernance}/feuille-de-route/${feuilleDeRoute.uid}`,
      montantSubventionAccorde: formatMontant(feuilleDeRoute.montantSubventionAccorde),
      montantSubventionDemande: formatMontant(feuilleDeRoute.montantSubventionDemande),
      montantSubventionFormationAccorde: formaterEnNombreFrancais(feuilleDeRoute.montantSubventionFormationAccorde),
      nom: feuilleDeRoute.nom,
      pieceJointe: feuilleDeRoute.pieceJointe && {
        ...feuilleDeRoute.pieceJointe,
        href: `/api/document-feuille-de-route/${feuilleDeRoute.pieceJointe.nom}`,
        upload: feuilleDeRoute.pieceJointe.upload ? formaterEnDateFrancaise(feuilleDeRoute.pieceJointe.upload): '',
      },
      porteur: feuilleDeRoute.porteur.nom,
      totalActions: `${feuilleDeRoute.totalActions} action${formatPluriel(feuilleDeRoute.totalActions)}`,
      wordingBeneficiairesSubvention: `Bénéficiaire${formatPluriel(nombreDeBeneficiairesSubvention)}`,
      wordingBeneficiairesSubventionFormation: `Bénéficiaire${formatPluriel(nombreDeBeneficiairesSubventionFormation)}`,
    }
  }
}

function toMembresViewModel(membre: MembreReadModel): MembreViewModel {
  return {
    logo: buildLogoMembre(membre),
    nom: membre.nom,
    roles: membre.roles.map(toRoleViewModel),
    type: membre.type,
  }
}

function toCoporteursDetailsViewModel(coporteurs: CoporteurDetailReadModel): MembreDetailsViewModel {
  const contactReferent = `${coporteurs.contactReferent.prenom} ${coporteurs.contactReferent.nom}, ${coporteurs.contactReferent.poste} ${coporteurs.contactReferent.mailContact}`

  const detailsAffichage: MembreDetailsViewModel['details'] = [
    ...coporteurs.contactReferent.denomination === 'Contact politique de la collectivité' ? [{ information: contactReferent, intitule: coporteurs.contactReferent.denomination }] : [],
    ...coporteurs.contactTechnique !== undefined && coporteurs.contactTechnique !== '' ?
      [{ information: coporteurs.contactTechnique, intitule: 'Contact technique' }] : [],
    ...isNaN(coporteurs.totalMontantSubventionAccorde ?? NaN) ? [] : [
      {
        information: `${coporteurs.totalMontantSubventionAccorde} €`,
        intitule: 'Total subventions accordées',
      },
    ],
    ...isNaN(coporteurs.totalMontantSubventionFormationAccorde ?? NaN) ? [] : [
      {
        information: `${coporteurs.totalMontantSubventionFormationAccorde} €`,
        intitule: 'Total subventions formations accordées',
      },
    ],
    ...coporteurs.contactReferent.denomination === 'Contact référent' ? [{ information: contactReferent, intitule: 'Contact référent' }] : [],
    {
      information: coporteurs.telephone === '' ? '-' : coporteurs.telephone,
      intitule: 'Téléphone',
    },
  ]
  const details = detailsAffichage.slice()
  if (coporteurs.feuillesDeRoute.length >= 1) {
    details.unshift(
      {
        feuillesDeRoute: coporteurs.feuillesDeRoute.map((feuilleDeRoute) => ({ nom: feuilleDeRoute.nom })),
        information: '',
        intitule: `Feuille${formatPluriel(coporteurs.feuillesDeRoute.length)} de route`,
      }
    )
  }

  return {
    details,
    logo: buildLogoMembre(coporteurs),
    nom: coporteurs.nom,
    plusDetailsHref: coporteurs.links.plusDetails,
    roles: coporteurs.roles.map(toRoleViewModel),
    type: coporteurs.type,
  }
}

function buildLogoMembre(membre: MembreReadModel): string {
  // Stryker disable next-line all
  return membre.type === 'Administration' ? 'bank-line' : 'community-line'
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
    [syntheseMembres.total, 'membre'] as const,
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

  const lien = gouvernance.feuillesDeRoute.length === 1 ? {
    label: 'Voir la feuille de route',
    url: `/gouvernance/${gouvernance.uid}/feuille-de-route/${gouvernance.feuillesDeRoute[0].uid}`,
  } : {
    label: 'Voir les feuilles de route',
    url: `/gouvernance/${gouvernance.uid}/feuilles-de-route`,
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

type ComiteResumeViewModel = Readonly<{
  intitule: string
  frequence: string
}> & ComiteViewModel

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

export type FeuilleDeRouteViewModel = Readonly<{
  nom: string
  porteur: string
  totalActions: string
  budgetGlobal: string
  lien: string
  montantSubventionDemande: string
  montantSubventionAccorde: string
  montantSubventionFormationAccorde: string
  beneficiairesSubvention: ReadonlyArray<MembreViewModel>
  beneficiairesSubventionFormation: ReadonlyArray<MembreViewModel>
  wordingBeneficiairesSubvention: string
  wordingBeneficiairesSubventionFormation: string
  pieceJointe?: Readonly<{
    apercu: string
    emplacement: string
    nom: string
    upload: string
    href: string
  }>
}>

type MembreViewModel = Readonly<{
  logo: string
  nom: string
  roles: ReadonlyArray<RoleViewModel>
  type: string
}>

export type MembreDetailsViewModel = Readonly<{
  nom: string
  logo: string
  roles: ReadonlyArray<RoleViewModel>
  type: string
  details: ReadonlyArray<
    Readonly<{
      intitule: string
      information: string
      feuillesDeRoute?: ReadonlyArray<
        Readonly<{
          nom: string
        }>
      >
    }>
  >
  plusDetailsHref?: string
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
