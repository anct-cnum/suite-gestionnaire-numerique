import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export interface FeuillesDeRouteDeposeesLoader {
  get(): Promise<ErrorReadModel | FeuillesDeRouteDeposeesReadModel>
}

export type FeuillesDeRouteDeposeesReadModel = Readonly<{
  nombreAvecDemandeSubvention: number
  nombreTotal: number
  ventilationParPerimetre: ReadonlyArray<{
    count: number
    perimetre: string
  }>
}>