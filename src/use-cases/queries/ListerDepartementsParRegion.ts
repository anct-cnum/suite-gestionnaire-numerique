import { QueryHandler } from '../QueryHandler'

// Liste des départements, regroupés par région, pour l'alternative à la carte de l'accueil.
export class ListerDepartementsParRegion implements QueryHandler<Query, DepartementsParRegionReadModel> {
  readonly #loader: DepartementsParRegionLoader

  constructor(loader: DepartementsParRegionLoader) {
    this.#loader = loader
  }

  async handle(): Promise<DepartementsParRegionReadModel> {
    return this.#loader.listerDepartementsParRegion()
  }
}

export interface DepartementsParRegionLoader {
  listerDepartementsParRegion(): Promise<DepartementsParRegionReadModel>
}

export type DepartementsParRegionReadModel = ReadonlyArray<
  Readonly<{
    codeDepartement: string
    codeRegion: string
    nomDepartement: string
    nomRegion: string
  }>
>

type Query = Readonly<Record<string, never>>
