import { Prisma } from '@prisma/client'

import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'

export interface GetFeuilleDeRouteRepository {
  get(uid: FeuilleDeRoute['uid']['state']['value']): Promise<FeuilleDeRoute>
}
export interface AddFeuilleDeRouteRepository {
  add(feuilleDeRoute: FeuilleDeRoute, tx?: Prisma.TransactionClient): Promise<boolean>
}
export interface UpdateFeuilleDeRouteRepository {
  update(feuilleDeRoute: FeuilleDeRoute, tx?: Prisma.TransactionClient): Promise<void>
}
export interface FeuilleDeRouteRepository extends
  AddFeuilleDeRouteRepository,
  GetFeuilleDeRouteRepository,
  UpdateFeuilleDeRouteRepository {}
