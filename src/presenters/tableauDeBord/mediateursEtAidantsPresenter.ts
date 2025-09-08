import { formaterEnNombreFrancais } from '../shared/number'
import { MediateursEtAidantsReadModel } from '@/use-cases/queries/RecupererMediateursEtAidants'

export function mediateursEtAidantsPresenter(readModel: MediateursEtAidantsReadModel): MediateursEtAidantsViewModel {
  return {
    departement: readModel.departement,
    total: formaterEnNombreFrancais(readModel.total),
  }
}

export type MediateursEtAidantsViewModel = Readonly<{
  departement: string
  total: string
}> 