import { formaterEnNombreFrancais } from '../shared/number'
import { MediateursEtAidantsReadModel } from '@/use-cases/queries/RecupererMediateursEtAidants'

export function mediateursEtAidantsPresenter(readModel: MediateursEtAidantsReadModel): MediateursEtAidantsViewModel {
  return {
    departement: readModel.departement,
    total: formaterEnNombreFrancais(readModel.total),
    totalEstPluriel: readModel.total > 1,
  }
}

export type MediateursEtAidantsViewModel = Readonly<{
  departement: string
  total: string
  totalEstPluriel: boolean
}>
