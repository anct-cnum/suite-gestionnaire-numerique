import { ErrorReadModel } from './shared/ErrorReadModel'

export interface IndicesLoader {
  getForCommunes(codesInsee: ReadonlyArray<string>): Promise<ErrorReadModel | ReadonlyArray<CommuneReadModel>>
  getForDepartement(codeDepartement: string): Promise<ErrorReadModel | ReadonlyArray<CommuneReadModel>>
  getForDepartements(
    codesDepartement: ReadonlyArray<string>
  ): Promise<ErrorReadModel | ReadonlyArray<DepartementIfnReadModel>>
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

export type DepartementIfnReadModel = Readonly<{
  codeDepartement: string
  ifn: number
}>

type DepartementReadModel = Readonly<{
  codeDepartement: string
  ifn: number
  indiceConfiance: null | string
}>
