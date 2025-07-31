import { ErrorReadModel } from './shared/ErrorReadModel'

export type TableauDeBordLoaderBeneficiaires = Readonly<{
  collectivite: number
  details: ReadonlyArray<Readonly<{
    label: string
    total: number
  }>>
  total: number
}>

export interface BeneficiairesLoader {
  get(territoire: string): Promise<ErrorReadModel | TableauDeBordLoaderBeneficiaires>
}
