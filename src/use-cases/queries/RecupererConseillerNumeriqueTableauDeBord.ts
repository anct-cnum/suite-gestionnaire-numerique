import { ErrorReadModel } from './shared/ErrorReadModel'

export type ConseillerNumeriqueTableauDeBordReadModel = Readonly<{
  enveloppes: ReadonlyArray<Readonly<{
    beneficiaires: number
    label: string
    total: number
  }>>
}>

export interface ConseillerNumeriqueTableauDeBordLoader {
  get(territoire: string): Promise<ConseillerNumeriqueTableauDeBordReadModel | ErrorReadModel>
}
