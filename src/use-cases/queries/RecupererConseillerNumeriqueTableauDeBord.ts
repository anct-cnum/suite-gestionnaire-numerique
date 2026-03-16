import { ErrorReadModel } from './shared/ErrorReadModel'

export type ConseillerNumeriqueTableauDeBordReadModel = Readonly<{
  enveloppes: ReadonlyArray<Readonly<{
    beneficiaires: number
    creditsEngages: number
    enveloppeTotale: number
    label: string
  }>>
}>

export interface ConseillerNumeriqueTableauDeBordLoader {
  get(territoire: string): Promise<ConseillerNumeriqueTableauDeBordReadModel | ErrorReadModel>
}
