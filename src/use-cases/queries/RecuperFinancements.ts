import { ErrorReadModel } from './shared/ErrorReadModel'

export interface FinancementLoader {
  get(territoire: string): Promise<ErrorReadModel | TableauDeBordLoaderFinancements>
}

export interface FinancementAdminLoader {
  get(): Promise<ErrorReadModel | TableauDeBordLoaderFinancementsAdmin>
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
    enveloppeTotale: string
    label: string
    total: string
  }>
}

export interface TableauDeBordLoaderFinancementsAdmin {
  creditsEngages: string
  montantTotalEnveloppes: string
  nombreDeFinancementsEngagesParLEtat: number
  nombreEnveloppes: number
  nombreEnveloppesUtilisees: number
  ventilationSubventionsParEnveloppe: ReadonlyArray<{
    enveloppeTotale: string
    label: string
    total: string
  }>
}