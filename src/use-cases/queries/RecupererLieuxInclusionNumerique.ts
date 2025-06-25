import { QueryHandler } from '../QueryHandler'
import { ErrorReadModel } from './shared/ErrorReadModel'

export class RecupererLieuxInclusionNumerique implements QueryHandler<Query, ErrorReadModel | LieuxInclusionNumeriqueReadModel> {
  readonly #lieuxInclusionNumeriqueLoader: LieuxInclusionNumeriqueLoader

  constructor(lieuxInclusionNumeriqueLoader: LieuxInclusionNumeriqueLoader) {
    this.#lieuxInclusionNumeriqueLoader = lieuxInclusionNumeriqueLoader
  }

  async handle(query: Query): Promise<ErrorReadModel | LieuxInclusionNumeriqueReadModel> {
    return this.#lieuxInclusionNumeriqueLoader.get(query.codeDepartement)
  }
}

export interface LieuxInclusionNumeriqueLoader {
  get(codeDepartement: string): Promise<ErrorReadModel | LieuxInclusionNumeriqueReadModel>
}

export type LieuxInclusionNumeriqueReadModel = Readonly<{
  departement: string
  nombreLieux: number
}>

type Query = Readonly<{
  codeDepartement: string
}>
