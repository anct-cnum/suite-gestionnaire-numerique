import { ErrorReadModel } from './shared/ErrorReadModel'

export interface FinancementLoader {
  get(territoire: string): Promise<ErrorReadModel | TableauDeBordLoaderFinancements>
}

export interface TableauDeBordLoaderFinancements {
  budget: Readonly<{
    feuillesDeRoute: number
    total: string
  }>
  credit: Readonly<{
    pourcentage: number
    total: string
  }>
  nombreDeFinancementsEngagesParLEtat: number
  ventilationSubventionsParEnveloppe: ReadonlyArray<{
    label: string
    total: string
    enveloppeTotale: string
  }>
}