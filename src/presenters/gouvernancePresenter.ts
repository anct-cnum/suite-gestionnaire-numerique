import { formaterEnDateFrancaise } from './shared/date'
import { formaterEnNombreFrancais } from './shared/number'
import { isNullish } from '@/shared/lang'
import { ComiteReadModel, FeuilleDeRouteReadModel, MembreDetailsReadModel, MembreReadModel, UneGouvernanceReadModel } from '@/use-cases/queries/RecupererUneGouvernance'

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

function isGouvernanceVide(gouvernanceReadModel: UneGouvernanceReadModel): boolean {
  return [
    gouvernanceReadModel.comites,
    gouvernanceReadModel.membres,
    gouvernanceReadModel.feuillesDeRoute,
    gouvernanceReadModel.noteDeContexte,
  ].every(isNullish)
}

function toComitesViewModel(comite: ComiteReadModel): ComiteViewModel {
  const dateProchainComite = comite.dateProchainComite ?
    `: ${formaterEnDateFrancaise(comite.dateProchainComite)}` :
    'en attente de planification'
  return {
    dateProchainComite,
    nom: `Comité ${comite.type}`,
    periodicite: comite.periodicite,
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

function toMembresDetailsViewModel(membre: MembreDetailsReadModel): MembreDetailsViewModel {
  return {
    contactPolitique: membre.contactPolitique,
    contactTechnique: membre.contactTechnique,
    feuillesDeRoute: membre.feuillesDeRoute,
    logo: buildLogoMembre(membre),
    nom: membre.nom,
    roles: membre.roles.map(toRoleViewModel),
    sectionFeuilleDeRoute: `Feuille${formatPluriel(membre.feuillesDeRoute.length)} de route`,
    telephone: membre.telephone !== '' ? membre.telephone : '-',
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

type ComiteViewModel = Readonly<{
  dateProchainComite: string
  nom: string
  periodicite: string
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
  contactTechnique: string,
  contactPolitique: string,
  telephone?: string,
  sectionFeuilleDeRoute: string,
  typologieMembre: string,
  feuillesDeRoute: ReadonlyArray<Readonly<{
    nom: string
  }>>
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
