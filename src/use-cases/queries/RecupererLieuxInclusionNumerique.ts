import { ErrorReadModel } from './shared/ErrorReadModel'

export interface LieuxInclusionNumeriqueLoader {
  get(codeDepartement: string): Promise<ErrorReadModel | LieuxInclusionNumeriqueReadModel>
}

export type LieuxInclusionNumeriqueReadModel = Readonly<{
  departement: string
  nombreLieux: number
}>

