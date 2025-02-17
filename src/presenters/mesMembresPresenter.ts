import { toRoleViewModel, RoleViewModel } from './shared/role'
import { MesMembresReadModel, MembreReadModel } from '@/use-cases/queries/RecupererMesMembres'

export function mesMembresPresenter(mesMembresReadModel: MesMembresReadModel): MesMembresViewModel {
  return {
    autorisations: mesMembresReadModel.autorisations,
    membres: mesMembresReadModel.membres.map(toMembreViewModel),
    roles: mesMembresReadModel.roles.map(toRoleViewModel),
    titre: `Gérer les membres · ${mesMembresReadModel.departement}`,
    typologies: mesMembresReadModel.typologies,
  }
}

function toMembreViewModel(membre: MembreReadModel): MembreViewModel {
  return {
    ...membre,
    contactReferent: `${membre.contactReferent.prenom} ${membre.contactReferent.nom}`,
    roles: membre.roles.map(toRoleViewModel),
  }
}

export type MesMembresViewModel = Readonly<{
  titre: string
  autorisations: Readonly<{
    ajouterUnMembre: boolean
    supprimerUnMembre: boolean
    accesMembreConfirme: boolean
  }>
  typologies: ReadonlyArray<string>
  roles: ReadonlyArray<RoleViewModel>
  membres: ReadonlyArray<MembreViewModel>
}>

type MembreViewModel = Readonly<{
  suppressionDuMembreAutorise: boolean
  contactReferent: string
  nom: string
  roles: ReadonlyArray<RoleViewModel>
  typologie: string
}>
