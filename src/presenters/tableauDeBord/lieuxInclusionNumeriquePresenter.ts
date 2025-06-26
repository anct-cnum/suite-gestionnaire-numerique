import { formaterEnNombreFrancais } from '../shared/number'
import { LieuxInclusionNumeriqueReadModel } from '@/use-cases/queries/RecupererLieuxInclusionNumerique'

export function lieuxInclusionNumeriquePresenter(readModel: LieuxInclusionNumeriqueReadModel)
  : LieuxInclusionNumeriqueViewModel {
  return {
    departement: readModel.departement,
    nombreLieux: formaterEnNombreFrancais(readModel.nombreLieux),
  }
}

export type LieuxInclusionNumeriqueViewModel = Readonly<{
  departement: string
  nombreLieux: string
}>
