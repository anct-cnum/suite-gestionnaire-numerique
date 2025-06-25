import { QueryHandler } from '../QueryHandler'
import { ErrorReadModel } from './shared/ErrorReadModel'

export class RecupererAccompagnementsRealises implements QueryHandler<Query, AccompagnementsRealisesReadModel | ErrorReadModel> {
  readonly #accompagnementsRealisesLoader: AccompagnementsRealisesLoader

  constructor(accompagnementsRealisesLoader: AccompagnementsRealisesLoader) {
    this.#accompagnementsRealisesLoader = accompagnementsRealisesLoader
  }

  async handle(query: Query): Promise<AccompagnementsRealisesReadModel | ErrorReadModel> {
    return this.#accompagnementsRealisesLoader.get(query.codeDepartement)
  }
}

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

type Query = Readonly<{
  codeDepartement: string
}>
