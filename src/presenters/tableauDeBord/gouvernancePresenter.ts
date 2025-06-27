import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { GouvernanceReadModel } from '@/use-cases/queries/RecupererTableauDeBordGouvernance'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export function gouvernancePresenter(
  readModel: ErrorReadModel | GouvernanceReadModel
): ErrorViewModel | GouvernanceViewModel {
  if (isErrorReadModel(readModel)) {
    return {
      message: readModel.message,
      type: 'error',
    }
  }

  return {
    collectivite: {
      membre: readModel.collectivite.membre,
      total: readModel.collectivite.total,
    },
    feuilleDeRoute: {
      action: readModel.feuilleDeRoute.action,
      total: readModel.feuilleDeRoute.total,
    },
    membre: {
      coporteur: readModel.membre.coporteur,
      total: readModel.membre.total,
    },
  }
}

export type GouvernanceViewModel = Readonly<{
  collectivite: Readonly<{
    membre: number
    total: number
  }>
  feuilleDeRoute: Readonly<{
    action: number
    total: number
  }>
  membre: Readonly<{
    coporteur: number
    total: number
  }>
}> 

function isErrorReadModel(readModel: ErrorReadModel | GouvernanceReadModel): readModel is ErrorReadModel {
  return 'type' in readModel
}