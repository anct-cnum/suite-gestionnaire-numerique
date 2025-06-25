import { QueryHandler } from '../QueryHandler'
import { ErrorReadModel } from './shared/ErrorReadModel'

export class RecupererMediateursEtAidants implements QueryHandler<Query, ErrorReadModel | MediateursEtAidantsReadModel> {
  readonly #mediateursEtAidantsLoader: MediateursEtAidantsLoader

  constructor(mediateursEtAidantsLoader: MediateursEtAidantsLoader) {
    this.#mediateursEtAidantsLoader = mediateursEtAidantsLoader
  }

  async handle(query: Query): Promise<ErrorReadModel | MediateursEtAidantsReadModel> {
    return this.#mediateursEtAidantsLoader.get(query.codeDepartement)
  }
}

export interface MediateursEtAidantsLoader {
  get(codeDepartement: string): Promise<ErrorReadModel | MediateursEtAidantsReadModel>
}

export type MediateursEtAidantsReadModel = Readonly<{
  departement: string
  nombreAidants: number
  nombreMediateurs: number
}>

type Query = Readonly<{
  codeDepartement: string
}>

