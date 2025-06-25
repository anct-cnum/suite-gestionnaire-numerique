import { QueryHandler } from '../QueryHandler'
import { ErrorReadModel } from './shared/ErrorReadModel'

export class RecupererMesIndicesDeFragilite implements 
QueryHandler<Query, ErrorReadModel | IndicesDeFragiliteReadModel> {
  readonly #indicesDeFragiliteLoader: IndicesDeFragiliteLoader

  constructor(indicesDeFragiliteLoader: IndicesDeFragiliteLoader) {
    this.#indicesDeFragiliteLoader = indicesDeFragiliteLoader
  }

  async handle(query: Query): Promise<ErrorReadModel | IndicesDeFragiliteReadModel> {
    return this.#indicesDeFragiliteLoader.get(query.codeDepartement)
  }
}

export interface IndicesDeFragiliteLoader {
  get(codeDepartement: string): Promise<ErrorReadModel | IndicesDeFragiliteReadModel>
}

export type IndicesDeFragiliteReadModel = Readonly<{
  communes: ReadonlyArray<CommuneReadModel>
  departement: string
}>

type CommuneReadModel = Readonly<{
  codeInsee: string
  score: null | number
}>

type Query = Readonly<{
  codeDepartement: string
}> 