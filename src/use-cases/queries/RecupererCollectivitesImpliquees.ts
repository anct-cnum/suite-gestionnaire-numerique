import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export interface CollectivitesLoader {
  get(): Promise<CollectivitesReadModel | ErrorReadModel>
}

export type CollectivitesReadModel = Readonly<{
  nombreCoporteurs: number
  nombreTotal: number
  ventilationParCategorie: ReadonlyArray<{
    categorie: string
    count: number
  }>
}>
