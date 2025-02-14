import { toRoleViewModel, RoleViewModel } from './shared/role'
import { MesMembresReadModel, MembreReadModel } from '@/use-cases/queries/RecupererMesMembres'

export function mesMembresPresenter(mesMembresReadModel: MesMembresReadModel): MesMembresViewModel {
  return {
    autorisations: mesMembresReadModel.autorisations,
    roles: mesMembresReadModel.roles.map(toRoleViewModel),
    titre: `Gérer les membres · ${mesMembresReadModel.departement}`,
    typologies: mesMembresReadModel.typologies,
    ...membresParStatut(mesMembresReadModel.membres.map(toMembreViewModel)),
  }
}

function membresParStatut(membres: ReadonlyArray<MembreViewModelWithStatut>): Pick<MesMembresViewModel, 'membres' | 'suggeres' | 'candidats'> {
  const membresGroupesParNomDeStatut = Object.groupBy(membres, ({ statut }) => statut)
  return {
    candidats: membresGroupesParNomDeStatut.candidat ?? [],
    membres: membresGroupesParNomDeStatut.confirme ?? [],
    suggeres: membresGroupesParNomDeStatut.suggere ?? [],
  }
}

function toMembreViewModel(membre: MembreReadModel): MembreViewModelWithStatut {
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
  candidats: ReadonlyArray<MembreViewModel>
  suggeres: ReadonlyArray<MembreViewModel>
}>

export type MembreViewModel = Readonly<{
  suppressionDuMembreAutorise: boolean
  contactReferent: string
  nom: string
  roles: ReadonlyArray<RoleViewModel>
  typologie: string
}>

type MembreViewModelWithStatut = MembreViewModel & Pick<MembreReadModel, 'statut'>
