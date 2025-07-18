import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export interface GouvernancesTerritorialesLoader {
  get(): Promise<ErrorReadModel | GouvernancesTerritorialesReadModel>
}

export type GouvernancesTerritorialesReadModel = Readonly<{
  nombreSansCoporteur: number
  nombreTotal: number
  ventilationParTypeDeCoporteur: ReadonlyArray<{
    count: number
    type: string
  }>
}>