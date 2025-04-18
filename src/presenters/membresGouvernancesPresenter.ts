import { RoleViewModel, toRoleViewModel } from '@/presenters/shared/role'
import { MembreReadModel } from '@/use-cases/queries/RecupererMesMembres'

export function toActionViewModel(readModels: ReadonlyArray<MembreReadModel>): Array<MembresGouvernancesViewModel>{
  return readModels
    .filter(readModel => readModel.statut === 'confirme')
    .map((readModel: MembreReadModel) => {
      return {
        nom: readModel.nom,
        roles: readModel.roles.map(toRoleViewModel),
        uid: readModel.uid,
      } as MembresGouvernancesViewModel
    })
}

export interface MembresGouvernancesViewModel {
  nom: string
  roles: Array<RoleViewModel>
  uid: string
}
