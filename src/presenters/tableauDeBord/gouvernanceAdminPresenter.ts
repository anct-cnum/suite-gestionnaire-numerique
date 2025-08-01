import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { GouvernanceAdminReadModel } from '@/use-cases/queries/RecupererTableauDeBordGouvernance'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export function gouvernanceAdminPresenter(
  readModel: ErrorReadModel | GouvernanceAdminReadModel
): ErrorViewModel | GouvernanceAdminViewModel {
  if (isErrorReadModel(readModel)) {
    return {
      message: readModel.message,
      type: 'error',
    }
  }

  return {
    feuilleDeRoute: {
      action: readModel.feuilleDeRoute.action,
      total: readModel.feuilleDeRoute.total,
    },
    nombreGouvernances: readModel.nombreGouvernances,
    nombreGouvernancesCoPortees: readModel.nombreGouvernancesCoPortees,
  }
}

export type GouvernanceAdminViewModel = Readonly<{
  feuilleDeRoute: Readonly<{
    action: number
    total: number
  }>
  nombreGouvernances: number
  nombreGouvernancesCoPortees: number
}>

function isErrorReadModel(readModel: ErrorReadModel | GouvernanceAdminReadModel): readModel is ErrorReadModel {
  return 'type' in readModel
}