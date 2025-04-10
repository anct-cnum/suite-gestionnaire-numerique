import { FeuilleDeRoute, FeuilleDeRouteUid } from '@/domain/FeuilleDeRoute'

export interface FeuilleDeRouteRepository {
  add(feuilleDeRoute: FeuilleDeRoute): Promise<boolean>
}

export interface GetFeuilleDeRouteRepository {
  get(uid: FeuilleDeRouteUid): Promise<FeuilleDeRoute>
}

export interface UpdateFeuilleDeRouteRepository {
  update(feuilleDeRoute: FeuilleDeRoute): Promise<void>
}
