import { formaterEnNombreFrancais } from './shared/number'
import { LieuxInclusionNumeriqueReadModel } from '@/use-cases/queries/RecupererLieuxInclusionNumerique'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export function lieuxInclusionNumeriquePresenter(
  readModel: ErrorReadModel | LieuxInclusionNumeriqueReadModel
): ErrorReadModel | LieuxInclusionNumeriqueViewModel {
  if (isErrorReadModel(readModel)) {
    return readModel
  }

  return {
    departement: readModel.departement,
    nombreLieux: formaterEnNombreFrancais(readModel.nombreLieux),
  }
}

export type LieuxInclusionNumeriqueViewModel = Readonly<{
  departement: string
  nombreLieux: string
}>

function isErrorReadModel(readModel: ErrorReadModel | LieuxInclusionNumeriqueReadModel): readModel is ErrorReadModel {
  return 'type' in readModel && readModel.type === 'error'
} 