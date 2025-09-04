import { ErrorReadModel } from './shared/ErrorReadModel'

export interface IndicesLoader {
  getForDepartement(codeDepartement: string): Promise<ErrorReadModel | ReadonlyArray<CommuneReadModel>>
  getForFrance(): Promise<DepartementsReadModel | ErrorReadModel>
}

export type CommuneReadModel = Readonly<{
  codeInsee: string
  ifn: null | number
}>

export type DepartementsReadModel = Readonly<{
  departements: Array<DepartementReadModel>
  statistiquesicp: {
    appuinecessaire: number
    atteignable: number
    compromis: number
    nonenregistres: number
    securise: number
  }
}>

type DepartementReadModel = Readonly<{
  codeDepartement: string
  ifn: number
  indiceConfiance: null | string
}>

