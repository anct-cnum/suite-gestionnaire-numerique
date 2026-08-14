import { ScopeFiltre } from './ResoudreContexte'
import { ErrorReadModel } from './shared/ErrorReadModel'

export type PointsVigilanceLieuxReadModel = Readonly<{
  nbLieuxAActualiser: number
  nbLieuxAVerifier: number
}>

export interface PointsVigilanceLieuxLoader {
  get(scopeFiltre: ScopeFiltre, now: Date): Promise<ErrorReadModel | PointsVigilanceLieuxReadModel>
}
