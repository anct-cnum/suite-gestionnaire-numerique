import { formaterLeRoleViewModel } from './shared/role'
import { MesMembresReadModel, MembreReadModel } from '@/use-cases/queries/RecupererMesMembres'

export function mesMembresPresenter(mesMembresReadModel: MesMembresReadModel): MesMembresViewModel {
  return {
    autorisations: mesMembresReadModel.autorisations,
    membres: mesMembresReadModel.membres.map(toMembreViewModel),
    roles: mesMembresReadModel.roles.map(formaterLeRoleViewModel),
    titre: `Gérer les membres · ${mesMembresReadModel.departement}`,
    typologies: mesMembresReadModel.typologies,
  }
}

function toMembreViewModel(membre: MembreReadModel): MembreViewModel {
  return {
    ...membre,
    contactReferent: `${membre.contactReferent.prenom} ${membre.contactReferent.nom}`,
    roles: membre.roles.map(formaterLeRoleViewModel),
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
  roles: ReadonlyArray<string>
  membres: ReadonlyArray<MembreViewModel>
}>

type MembreViewModel = Readonly<{
  suppressionDuMembreAutorise: boolean
  contactReferent: string
  nom: string
  roles: ReadonlyArray<string>
  typologie: string
}>
