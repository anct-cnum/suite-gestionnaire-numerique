import { formaterEnNombreFrancais } from './number'
import { MediateursEtAidantsReadModel } from '@/use-cases/queries/RecupererMediateursEtAidants'

export function mediateursEtAidantsPresenter(readModel: MediateursEtAidantsReadModel): MediateursEtAidantsViewModel {
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