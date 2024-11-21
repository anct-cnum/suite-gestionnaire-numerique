import { formaterEnDateFrancaise } from './shared/date'
import { formaterEnNombreFrancais } from './shared/number'
import { isNullish } from '@/shared/lang'
import { ComiteReadModel, FeuilleDeRouteReadModel, MembreReadModel, UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'

export function gouvernancePresenter(
  gouvernanceReadModel: UneGouvernanceReadModel
): GouvernanceViewModel {
  return {
    ...{ comites: gouvernanceReadModel.comites?.map(toComitesViewModel) },
    departement: gouvernanceReadModel.departement,
    isVide: isGouvernanceVide(gouvernanceReadModel),
    sectionFeuillesDeRoute: {
      ...{ feuillesDeRoute: gouvernanceReadModel.feuillesDeRoute?.map(toFeuillesDeRouteViewModel) },
      ...buildTitresFeuillesDeRoute(gouvernanceReadModel.feuillesDeRoute),
    },
    sectionMembres: {
      ...{ membres: gouvernanceReadModel.membres?.map(toMembresViewModel) },
      ...buildSousTitreMembres(gouvernanceReadModel.membres),
    },
    sectionNoteDeContexte: {
      ...{ noteDeContexte: toNoteDeContexteViewModel(gouvernanceReadModel.noteDeContexte) },
      sousTitre: buildSousTitreNoteDeContexte(gouvernanceReadModel.noteDeContexte),
    },
  }
}

export type GouvernanceViewModel = Readonly<{
  comites?: ReadonlyArray<ComiteViewModel>
  departement: string
  isVide: boolean
  sectionFeuillesDeRoute: Readonly<{
    budgetTotalCumule: string
    feuillesDeRoute?: ReadonlyArray<FeuilleDeRouteViewModel>
    total: string
    wording: string
    lien: Readonly<{
      label: string
      url: URL
    }>
  }>
  sectionMembres: Readonly<{
    detailDuNombreDeChaqueMembre: string
    membres?: ReadonlyArray<MembreViewModel>
    total: string
    wording: string
  }>
  sectionNoteDeContexte: Readonly<{
    noteDeContexte?: NoteDeContexteViewModel
    sousTitre: string
  }>
}>

function isGouvernanceVide(gouvernanceReadModel: UneGouvernanceReadModel): boolean {
  return [
    gouvernanceReadModel.comites,
    gouvernanceReadModel.membres,
    gouvernanceReadModel.feuillesDeRoute,
    gouvernanceReadModel.noteDeContexte,
  ].every(isNullish)
}

function toComitesViewModel(comite: ComiteReadModel): ComiteViewModel {
  return {
    dateProchainComite: formaterEnDateFrancaise(comite.dateProchainComite),
    nom: comite.nom,
    periodicite: comite.periodicite,
  }
}

function toFeuillesDeRouteViewModel(feuilleDeRoute: FeuilleDeRouteReadModel): FeuilleDeRouteViewModel {
  return {
    budgetGlobal: formaterEnNombreFrancais(feuilleDeRoute.budgetGlobal),
    nom: feuilleDeRoute.nom,
    totalActions: `${feuilleDeRoute.totalActions} action${formatPluriel(feuilleDeRoute.totalActions)}`,
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
  if (!noteDeContexte) return undefined

  return {
    dateDeModification: formaterEnDateFrancaise(noteDeContexte.dateDeModification),
    nomAuteur: noteDeContexte.nomAuteur,
    prenomAuteur: noteDeContexte.prenomAuteur,
    texteAvecHTML: noteDeContexte.texte,
    texteSansHTML: `${noteDeContexte.texte.replace(/<[^>]*>/g, '').substring(0, 290)}...`,
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
        url: new URL('/', process.env.NEXT_PUBLIC_HOST),
      },
      total: '0',
      wording: 'feuille de route',
    }
  }

  const lien = feuillesDeRoute.length === 1 ? {
    label: 'Voir la feuille de route',
    url: new URL('/feuille-de-route', process.env.NEXT_PUBLIC_HOST),
  } : {
    label: 'Voir les feuilles de route',
    url: new URL('/feuilles-de-route', process.env.NEXT_PUBLIC_HOST),
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
  if (!noteDeContexte) return ''

  return `Modifié le ${formaterEnDateFrancaise(noteDeContexte.dateDeModification)} par ${noteDeContexte.prenomAuteur} ${noteDeContexte.nomAuteur}`
}

function formatPluriel(count: number): 's' | '' {
  return count > 1 ? 's' : ''
}

type ComiteViewModel = Readonly<{
  dateProchainComite: string
  nom: string
  periodicite: string
}>

type FeuilleDeRouteViewModel = Readonly<{
  budgetGlobal: string
  nom: string
  totalActions: string
}>

type MembreViewModel = Readonly<{
  logo: string
  nom: string
  roles: ReadonlyArray<RoleViewModel>
  type: string
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
