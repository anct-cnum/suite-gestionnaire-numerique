import { ErrorReadModel } from './shared/ErrorReadModel'

export interface AccompagnementsRealisesLoader {
  get(codeDepartement: string): Promise<AccompagnementsRealisesReadModel | ErrorReadModel>
}

export type AccompagnementsRealisesReadModel = Readonly<{
  departement: string
  nombreTotal: number
  repartitionMensuelle: ReadonlyArray<RepartitionMensuelleReadModel>
}>

type RepartitionMensuelleReadModel = Readonly<{
  mois: string
  nombre: number
}>
