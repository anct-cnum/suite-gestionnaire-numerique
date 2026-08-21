import { ErrorReadModel } from './shared/ErrorReadModel'
import { FiltreTerritorial } from './shared/FiltreTerritorial'

export interface MediateursEtAidantsLoader {
  get(filtre: FiltreTerritorial): Promise<ErrorReadModel | MediateursEtAidantsReadModel>
}

export type MediateursEtAidantsReadModel = Readonly<{
  departement: string
  total: number
}>
