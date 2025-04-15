import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'

export interface GetFeuilleDeRouteRepository {
  get(uid: FeuilleDeRoute['uid']['state']['value']): Promise<FeuilleDeRoute>
}
export interface AddFeuilleDeRouteRepository {
  add(feuilleDeRoute: FeuilleDeRoute): Promise<boolean>
}
export interface UpdateFeuilleDeRouteRepository {
  update(feuilleDeRoute: FeuilleDeRoute): Promise<void>
}
export interface FeuilleDeRouteRepository extends
  AddFeuilleDeRouteRepository,
  GetFeuilleDeRouteRepository,
  UpdateFeuilleDeRouteRepository {}
