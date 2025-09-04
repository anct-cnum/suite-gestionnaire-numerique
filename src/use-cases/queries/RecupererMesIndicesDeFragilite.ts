import { ErrorReadModel } from './shared/ErrorReadModel'

export interface IndicesLoader {
  getForDepartement(codeDepartement: string): Promise<ErrorReadModel | ReadonlyArray<CommuneReadModel>>
  getForFrance(): Promise<ErrorReadModel | DepartementsReadModel>
}

export type CommuneReadModel = Readonly<{
  codeInsee: string
  ifn: null | number
}>

export type DepartementReadModel = Readonly<{
  codeDepartement: string
  ifn: number
  indiceConfiance: string | null
}>



export type DepartementsReadModel = Readonly<{
  statistiquesicp: {
    securise: number
    appuinecessaire: number
    atteignable: number
    compromis: number
    nonenregistres: number
  }
  departements: Array<DepartementReadModel>
}>