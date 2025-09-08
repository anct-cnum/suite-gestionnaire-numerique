import { ErrorReadModel } from './shared/ErrorReadModel'

export interface MediateursEtAidantsLoader {
  get(territoire: string): Promise<ErrorReadModel | MediateursEtAidantsReadModel>
}

export type MediateursEtAidantsReadModel = Readonly<{
  departement: string
  total: number
}>
