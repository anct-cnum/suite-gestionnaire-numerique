import { formaterEnNombreFrancais } from './shared/number'
import { AccompagnementsRealisesReadModel } from '@/use-cases/queries/RecupererAccompagnementsRealises'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export function accompagnementsRealisesPresenter(readModel: AccompagnementsRealisesReadModel | ErrorReadModel): AccompagnementsRealisesViewModel | ErrorReadModel {
  if (isErrorReadModel(readModel)) {
    return readModel
  }

  return {
    departement: readModel.departement,
    graphique: {
      backgroundColor: ['#CACAFB', '#CACAFB', '#CACAFB', '#CACAFB', '#CACAFB', '#6A6AF4'],
      data: readModel.repartitionMensuelle.map((item) => item.nombre),
      labels: readModel.repartitionMensuelle.map((item) => item.mois),
    },
    nombreTotal: formaterEnNombreFrancais(readModel.nombreTotal),
  }
}

export type AccompagnementsRealisesViewModel = Readonly<{
  departement: string
  graphique: Readonly<{
    backgroundColor: ReadonlyArray<string>
    data: ReadonlyArray<number>
    labels: Array<string>
  }>
  nombreTotal: string
}>

function isErrorReadModel(readModel: AccompagnementsRealisesReadModel | ErrorReadModel): readModel is ErrorReadModel {
  return 'type' in readModel && readModel.type === 'error'
} 