import { formaterEnDateFrancaise, formatForInputDate } from './shared/date'
import { formaterEnNombreFrancais } from './shared/number'
import { toRoleViewModel } from './shared/role'
import { formatPluriel } from './shared/text'
import { isNullish } from '@/shared/lang'
import { ComiteReadModel, FeuilleDeRouteReadModel, CoporteurDetailReadModel, MembreReadModel, UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'

export function gouvernancePresenter(
  gouvernanceReadModel: UneGouvernanceReadModel,
  now: Date
): GouvernanceViewModel {
  const hasMembres = gouvernanceReadModel.syntheseMembres.total !== 0
  return {
    ...{ comites: gouvernanceReadModel.comites?.map((comite) => toComitesViewModel(comite, now)) },
    comiteARemplir,
    dateAujourdhui: formatForInputDate(now),
    departement: gouvernanceReadModel.departement,
    hasMembres,
    isVide: isGouvernanceVide(gouvernanceReadModel, !hasMembres),
    notePrivee: toNotePriveeViewModel(gouvernanceReadModel.notePrivee),
    sectionFeuillesDeRoute: {
      ...{ feuillesDeRoute: gouvernanceReadModel.feuillesDeRoute?.map(toFeuillesDeRouteViewModel) },
      ...buildTitresFeuillesDeRoute(gouvernanceReadModel.feuillesDeRoute),
    },
    sectionMembres: {
      ...{ coporteurs: gouvernanceReadModel.syntheseMembres.coporteurs.map(toCoporteursDetailsViewModel) },
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
  comites?: ReadonlyArray<ComiteResumeViewModel>
  comiteARemplir: ComiteViewModel
  dateAujourdhui: string
  departement: string
  isVide: boolean
  hasMembres: boolean
  notePrivee?: Readonly<{
    edition: string
    resume: string
    texte: string
  }>
  sectionFeuillesDeRoute: Readonly<{
    budgetTotalCumule: string
    feuillesDeRoute?: ReadonlyArray<FeuilleDeRouteViewModel>
    total: string
    wording: string
    lien: Readonly<{
      label: string
      url: string
    }>
  }>
  sectionMembres: Readonly<{
    coporteurs: ReadonlyArray<MembreDetailsViewModel>
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

function isGouvernanceVide(gouvernanceReadModel: UneGouvernanceReadModel, pasDeMembre: boolean): boolean {
  return [
    gouvernanceReadModel.comites,
    gouvernanceReadModel.feuillesDeRoute,
    gouvernanceReadModel.noteDeContexte,
  ].every(isNullish) && pasDeMembre
}

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

function toFeuillesDeRouteViewModel(feuilleDeRoute: FeuilleDeRouteReadModel): FeuilleDeRouteViewModel {
  const nombreDeBeneficiairesSubvention = feuilleDeRoute.beneficiairesSubvention.length
  const nombreDeBeneficiairesSubventionFormation = feuilleDeRoute.beneficiairesSubventionFormation.length
  return {
    beneficiairesSubvention: feuilleDeRoute.beneficiairesSubvention.map(toMembresViewModel),
    beneficiairesSubventionFormation: feuilleDeRoute.beneficiairesSubventionFormation.map(toMembresViewModel),
    budgetGlobal: formaterEnNombreFrancais(feuilleDeRoute.budgetGlobal),
    montantSubventionAccorde: formaterEnNombreFrancais(feuilleDeRoute.montantSubventionAccorde),
    montantSubventionDemande: formaterEnNombreFrancais(feuilleDeRoute.montantSubventionDemande),
    montantSubventionFormationAccorde: formaterEnNombreFrancais(feuilleDeRoute.montantSubventionFormationAccorde),
    nom: feuilleDeRoute.nom,
    porteur: feuilleDeRoute.porteur.nom,
    totalActions: `${feuilleDeRoute.totalActions} action${formatPluriel(feuilleDeRoute.totalActions)}`,
    wordingBeneficiairesSubvention: `Bénéficiaire${formatPluriel(nombreDeBeneficiairesSubvention)}`,
    wordingBeneficiairesSubventionFormation: `Bénéficiaire${formatPluriel(nombreDeBeneficiairesSubventionFormation)}`,
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
  if (syntheseMembres.total === 0) {
    return '0 membre'
  }
  return [
    [syntheseMembres.coporteurs.length, 'co-porteur'] as const,
    [syntheseMembres.total, 'membre'] as const,
    [syntheseMembres.candidats, 'candidat'] as const,
  ]
    .map(([nombre, categorie]) => `${nombre} ${categorie}${formatPluriel(nombre)}`)
    .join(', ')
}

function buildTitresFeuillesDeRoute(feuillesDeRoute: UneGouvernanceReadModel['feuillesDeRoute']): GouvernanceViewModel['sectionFeuillesDeRoute'] {
  if (!feuillesDeRoute) {
    return {
      budgetTotalCumule: '0',
      lien: {
        label: '',
        url: '/',
      },
      total: '0',
      wording: 'feuille de route',
    }
  }

  const lien = feuillesDeRoute.length === 1 ? {
    label: 'Voir la feuille de route',
    url: '/feuille-de-route',
  } : {
    label: 'Voir les feuilles de route',
    url: '/feuilles-de-route',
  }

  const nombreDeFeuillesDeRoute = feuillesDeRoute.length
  const budgetTotalCumule = feuillesDeRoute.reduce((budget, feuilleDeRoute) => budget + feuilleDeRoute.budgetGlobal, 0)

  return {
    budgetTotalCumule: formaterEnNombreFrancais(budgetTotalCumule),
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
  montantSubventionDemande: string
  montantSubventionAccorde: string
  montantSubventionFormationAccorde: string
  beneficiairesSubvention: ReadonlyArray<MembreViewModel>
  beneficiairesSubventionFormation: ReadonlyArray<MembreViewModel>
  wordingBeneficiairesSubvention: string
  wordingBeneficiairesSubventionFormation: string
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

type RoleViewModel = Readonly<{
  color: string
  nom: string
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
