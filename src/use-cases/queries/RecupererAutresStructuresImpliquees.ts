import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export interface AutresStructuresLoader {
  get(): Promise<AutresStructuresReadModel | ErrorReadModel>
}

export type AutresStructuresReadModel = Readonly<{
  nombreCoporteurs: number
  nombreTotal: number
  ventilationParCategorie: ReadonlyArray<{
    categorie: string
    count: number
  }>
}>
