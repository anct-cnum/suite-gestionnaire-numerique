import { ErrorReadModel } from './shared/ErrorReadModel'

export interface IndicesLoader {
  getForDepartement(codeDepartement: string): Promise<ErrorReadModel | ReadonlyArray<CommuneReadModel>>
  getForFrance(): Promise<ErrorReadModel | ReadonlyArray<DepartementReadModel>>
}

export type CommuneReadModel = Readonly<{
  codeInsee: string
  ifn: null | number
}>

export type DepartementReadModel = Readonly<{
  codeDepartement: string
  ifn: number
  indiceConfiance: number
}>