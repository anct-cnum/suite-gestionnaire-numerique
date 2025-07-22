import { ErrorReadModel } from './shared/ErrorReadModel'

export interface RecupererTableauDeBordGouvernanceLoader {
  get(territoire: string): Promise<ErrorReadModel | GouvernanceReadModel>
} 

export type GouvernanceReadModel = Readonly<{
  collectivite: Readonly<{
    membre: number
    total: number
  }>
  feuilleDeRoute: Readonly<{
    action: number
    total: number
  }>
  membre: Readonly<{
    coporteur: number
    total: number
  }>
}> 