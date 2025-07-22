import { ErrorReadModel } from './shared/ErrorReadModel'

export interface IndicesDeFragiliteLoader {
  get(territoire: string): Promise<ErrorReadModel | IndicesDeFragiliteReadModel>
}

export type IndicesDeFragiliteReadModel = IndicesDeFragiliteCommuneReadModel | IndicesDeFragiliteDepartementReadModel

type IndicesDeFragiliteCommuneReadModel = Readonly<{
  communes: ReadonlyArray<CommuneReadModel>
  departement: string
  type: 'communes'
}>

type IndicesDeFragiliteDepartementReadModel = Readonly<{
  departements: ReadonlyArray<DepartementReadModel>
  territoire: string
  type: 'departements'
}>

type CommuneReadModel = Readonly<{
  codeInsee: string
  score: null | number
}>

type DepartementReadModel = Readonly<{
  codeDepartement: string
  score: number
}>