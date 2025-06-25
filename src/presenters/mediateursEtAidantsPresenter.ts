import { formaterEnNombreFrancais } from './shared/number'
import { MediateursEtAidantsReadModel } from '@/use-cases/queries/RecupererMediateursEtAidants'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export function mediateursEtAidantsPresenter(readModel: ErrorReadModel | MediateursEtAidantsReadModel): ErrorReadModel | MediateursEtAidantsViewModel {
  if (isErrorReadModel(readModel)) {
    return readModel
  }

  return {
    departement: readModel.departement,
    nombreAidants: formaterEnNombreFrancais(readModel.nombreAidants),
    nombreMediateurs: formaterEnNombreFrancais(readModel.nombreMediateurs),
    total: formaterEnNombreFrancais(readModel.nombreMediateurs + readModel.nombreAidants),
  }
}

export type MediateursEtAidantsViewModel = Readonly<{
  departement: string
  nombreAidants: string
  nombreMediateurs: string
  total: string
}>

function isErrorReadModel(readModel: ErrorReadModel | MediateursEtAidantsReadModel): readModel is ErrorReadModel {
  return 'type' in readModel && readModel.type === 'error'
} 