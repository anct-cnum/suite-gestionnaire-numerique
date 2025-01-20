import { formaterEnDateFrancaise, formatForInputDate } from './shared/date'
import { formaterEnNombreFrancais } from './shared/number'
import { isNullish } from '@/shared/lang'
import { ComiteReadModel, FeuilleDeRouteReadModel, MembreDetailReadModel, MembreReadModel, UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'

export function gouvernancePresenter(
  gouvernanceReadModel: UneGouvernanceReadModel,
  now: Date
): GouvernanceViewModel {
  return {
    ...{ comites: gouvernanceReadModel.comites?.map((comite) => toComitesViewModel(comite, now)) },
    comiteVide: buildComiteVide(),
    departement: gouvernanceReadModel.departement,
    isVide: isGouvernanceVide(gouvernanceReadModel),
    sectionFeuillesDeRoute: {
      ...{ feuillesDeRoute: gouvernanceReadModel.feuillesDeRoute?.map(toFeuillesDeRouteViewModel) },
      ...buildTitresFeuillesDeRoute(gouvernanceReadModel.feuillesDeRoute),
    },
    sectionMembres: {
      ...{ membres: gouvernanceReadModel.membres?.map(toMembresDetailsViewModel) },
      ...buildSousTitreMembres(gouvernanceReadModel.membres),
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
  comiteVide: ComiteViewModel
  departement: string
  isVide: boolean
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
    detailDuNombreDeChaqueMembre: string
    membres?: ReadonlyArray<MembreDetailsViewModel>
    total: string
    wording: string
  }>
  sectionNoteDeContexte: Readonly<{
    noteDeContexte?: NoteDeContexteViewModel
    sousTitre: string
  }>
  uid: string
}>

export const gouvernanceVideViewModel: GouvernanceViewModel = {
  departement: 'Rhône',
  isVide: true,
  sectionFeuillesDeRoute: {
    budgetTotalCumule: '',
    lien: {
      label: '',
      url: new URL('/', process.env.NEXT_PUBLIC_HOST).toString(),
    },
    total: '',
    wording: '',
  },
  sectionMembres: {
    detailDuNombreDeChaqueMembre: '',
    total: '',
    wording: '',
  },
  sectionNoteDeContexte: {
    sousTitre: '',
  },
  uid: '',
}

function isGouvernanceVide(gouvernanceReadModel: UneGouvernanceReadModel): boolean {
  return [
    gouvernanceReadModel.comites,
    gouvernanceReadModel.membres,
    gouvernanceReadModel.feuillesDeRoute,
    gouvernanceReadModel.noteDeContexte,
  ].every(isNullish)
}

function buildComiteVide(): ComiteViewModel {
  return {
    frequences,
    types,
  }
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

function toMembresDetailsViewModel(membre: MembreDetailReadModel): MembreDetailsViewModel {
  const contactReferent = `${membre.contactReferent.prenom} ${membre.contactReferent.nom}, ${membre.contactReferent.poste} ${membre.contactReferent.mailContact}`

  const detailsAffichage: MembreDetailsViewModel['details'] = [
    ...membre.contactReferent.denomination === 'Contact politique de la collectivité' ? [{ information: contactReferent, intitule: membre.contactReferent.denomination }] : [],
    ...membre.contactTechnique !== undefined && membre.contactTechnique !== '' ?
      [{ information: membre.contactTechnique, intitule: 'Contact technique' }] : [],
    ...isNaN(membre.totalMontantSubventionAccorde ?? NaN) ? [] : [
      {
        information: `${membre.totalMontantSubventionAccorde} €`,
        intitule: 'Total subventions accordées',
      },
    ],
    ...isNaN(membre.totalMontantSubventionFormationAccorde ?? NaN) ? [] : [
      {
        information: `${membre.totalMontantSubventionFormationAccorde} €`,
        intitule: 'Total subventions formations accordées',
      },
    ],
    ...membre.contactReferent.denomination === 'Contact référent' ? [{ information: contactReferent, intitule: 'Contact référent' }] : [],
    {
      information: membre.telephone === '' ? '-' : membre.telephone,
      intitule: 'Téléphone',
    },
  ]
  const details = detailsAffichage.slice()
  if (membre.feuillesDeRoute.length >= 1) {
    details.unshift(
      {
        feuillesDeRoute: membre.feuillesDeRoute.map((feuilleDeRoute) => ({ nom: feuilleDeRoute.nom })),
        information: '',
        intitule: `Feuille${formatPluriel(membre.feuillesDeRoute.length)} de route`,
      }
    )
  }

  return {
    details,
    logo: buildLogoMembre(membre),
    nom: membre.nom,
    plusDetailsHref: membre.links.plusDetails,
    roles: membre.roles.map(toRoleViewModel),
    type: membre.type,
    typologieMembre: membre.typologieMembre,
  }
}

function buildLogoMembre(membre: MembreReadModel): string {
  // Stryker disable next-line all
  return membre.type === 'Administration' ? 'bank-line' : 'community-line'
}

function toRoleViewModel(role: string): RoleViewModel {
  return {
    color: roleAndHisColor[role],
    nom: role,
  }
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
    // eslint-disable-next-line sonarjs/slow-regex
    texteSansHTML: `${noteDeContexte.texte.replace(/(?:<(?:[^>]+)>)/g, '').substring(0, 290)}...`,
  }
}

function buildSousTitreMembres(membres: UneGouvernanceReadModel['membres']): GouvernanceViewModel['sectionMembres'] {
  if (!membres) {
    return {
      detailDuNombreDeChaqueMembre: '0',
      total: '0',
      wording: 'membre',
    }
  }

  const detailDuNombreDeChaqueMembre = Object.entries(membres
    .flatMap(({ roles }) => roles)
    .reduce<Record<string, number>>((nombreParRole, role) => {
      nombreParRole[role] = nombreParRole[role] ? nombreParRole[role] + 1 : 1

      return nombreParRole
    }, {}))
    .map(([role, nombre]) => `${nombre} ${role.toLowerCase()}${formatPluriel(nombre)}`)
    .join(', ')

  return {
    detailDuNombreDeChaqueMembre,
    total: String(membres.length),
    wording: `membre${formatPluriel(membres.length)}`,
  }
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

function formatPluriel(count: number): 's' | '' {
  return count > 1 ? 's' : ''
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
  typologieMembre: string
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

type NoteDeContexteViewModel = Readonly<{
  dateDeModification: string
  nomAuteur: string
  prenomAuteur: string
  texteAvecHTML: string
  texteSansHTML: string
}>

// Stryker disable next-line ObjectLiteral
const roleAndHisColor: Record<string, string> = {
  Bénéficiaire: 'purple-glycine',
  'Co-porteur': 'info',
  Financeur: 'warning',
  Formation: 'green-tilleul-verveine',
  Observateur: 'beige-gris-galet',
  Porteur: 'info',
  Récipiendaire: 'green-archipel',
}

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
