import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'

export interface FeuilleDeRouteRepository {
  add(feuilleDeRoute: FeuilleDeRoute): Promise<boolean>
}
