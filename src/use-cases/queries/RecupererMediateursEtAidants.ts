import { ErrorReadModel } from './shared/ErrorReadModel'

export interface MediateursEtAidantsLoader {
  get(codeDepartement: string): Promise<ErrorReadModel | MediateursEtAidantsReadModel>
}

export type MediateursEtAidantsReadModel = Readonly<{
  departement: string
  nombreAidants: number
  nombreMediateurs: number
}>
