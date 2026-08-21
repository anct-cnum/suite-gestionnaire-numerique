import { ErrorReadModel } from './shared/ErrorReadModel'
import { FiltreTerritorial } from './shared/FiltreTerritorial'

export interface LieuxInclusionNumeriqueLoader {
  get(filtre: FiltreTerritorial): Promise<ErrorReadModel | LieuxInclusionNumeriqueReadModel>
}

export type LieuxInclusionNumeriqueReadModel = Readonly<{
  departement: string
  nombreLieux: number
}>
