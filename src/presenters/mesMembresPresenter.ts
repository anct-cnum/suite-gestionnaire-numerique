import { MesMembresReadModel, Membre } from '@/use-cases/queries/RecupererMesMembres'

export function mesMembresPresenter(mesMembresReadModel: MesMembresReadModel): MesMembresViewModel {
  return {
    autorisations: mesMembresReadModel.autorisations,
    membres: mesMembresReadModel.membres.map(toMembreViewModel),
    roles: mesMembresReadModel.roles,
    titre: `Gérer les membres - ${mesMembresReadModel.departement}`,
    typologies: mesMembresReadModel.typologies,
  }
}
function toMembreViewModel(membre: Membre): MembreViewModel {
  return {
    ...membre,
    contactReferent: `${membre.contactReferent.prenom} ${membre.contactReferent.nom}`,
    roles: membre.roles.map(toRoleViewModel),
  }
}
function toRoleViewModel(role: string): RoleViewModel {
  const formaterLeRole = roleformat[role]
  return {
    color: roleAndHisColor[formaterLeRole],
    nom: formaterLeRole,
  }
}

type MesMembresViewModel = Readonly<{
  titre: string
  autorisations: Readonly<{
    ajouterUnMembre: boolean
    supprimerUnMembre: boolean
    accesMembreValide: boolean
  }>
  typologies: ReadonlyArray<string>
  roles: ReadonlyArray<string>
  membres: ReadonlyArray<MembreViewModel>
}>

type MembreViewModel = Readonly<{
  suppressionDuMembreAutorise: boolean
  contactReferent: string
  nom: string
  roles: ReadonlyArray<RoleViewModel>
  typologie: string
}>

// Stryker disable next-line ObjectLiteral
const roleAndHisColor: Record<string, string> = {
  Bénéficiaire: 'purple-glycine',
  'Co-financeur': 'warning',
  'Co-porteur': 'info',
  Formation: 'green-tilleul-verveine',
  Observateur: 'beige-gris-galet',
  Porteur: 'info',
  Récipiendaire: 'green-archipel',
}

// Stryker disable next-line ObjectLiteral
const roleformat: Record<string, string> = {
  Formation: 'Formation',
  beneficiaire: 'Bénéficiaire',
  cofinanceur: 'Co-financeur',
  coporteur: 'Co-porteur',
  observateur: 'Observateur',
  recipiendaire: 'Récipiendaire',
}

type RoleViewModel = Readonly<{
  color: string
  nom: string
}>
