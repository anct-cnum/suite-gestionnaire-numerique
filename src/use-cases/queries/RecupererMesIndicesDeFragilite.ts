import { ErrorReadModel } from './shared/ErrorReadModel'

export interface IndicesDeFragiliteLoader {
  getForDepartement(codeDepartement: string): Promise<ErrorReadModel | ReadonlyArray<CommuneReadModel>>
  getForFrance(): Promise<ErrorReadModel | ReadonlyArray<DepartementReadModel>>
}

export type CommuneReadModel = Readonly<{
  codeInsee: string
  score: null | number
}>

export type DepartementReadModel = Readonly<{
  codeDepartement: string
  score: number
}>