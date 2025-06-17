import { QueryHandler } from '../QueryHandler'

export class RecupererMesIndicesDeFragilite implements QueryHandler<Query, IndicesDeFragiliteReadModel> {
  readonly #indicesDeFragiliteLoader: IndicesDeFragiliteLoader

  constructor(indicesDeFragiliteLoader: IndicesDeFragiliteLoader) {
    this.#indicesDeFragiliteLoader = indicesDeFragiliteLoader
  }

  async handle(query: Query): Promise<IndicesDeFragiliteReadModel> {
    return this.#indicesDeFragiliteLoader.get(query.codeDepartement)
  }
}

export interface IndicesDeFragiliteLoader {
  get(codeDepartement: string): Promise<IndicesDeFragiliteReadModel>
}

export type IndicesDeFragiliteReadModel = Readonly<{
  communes: ReadonlyArray<CommuneReadModel>
  departement: string
}>

export type CommuneReadModel = Readonly<{
  codeInsee: string
  score: null | number
}>

type Query = Readonly<{
  codeDepartement: string
}> 