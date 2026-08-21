import { QueryHandler } from '../QueryHandler'

const limiteDeResultats = 5

export class RechercherTerritoires implements QueryHandler<Query, TerritoiresTrouvesReadModel> {
  readonly #rechercheTerritoiresLoader: RechercheTerritoiresLoader

  constructor(rechercheTerritoiresLoader: RechercheTerritoiresLoader) {
    this.#rechercheTerritoiresLoader = rechercheTerritoiresLoader
  }

  async handle(query: Query): Promise<TerritoiresTrouvesReadModel> {
    return this.#rechercheTerritoiresLoader.rechercher(query.terme, limiteDeResultats, query.perimetre)
  }
}

export interface RechercheTerritoiresLoader {
  rechercher(
    terme: string,
    limite: number,
    perimetre: PerimetreRechercheTerritoires
  ): Promise<TerritoiresTrouvesReadModel>
}

export type PerimetreRechercheTerritoires =
  | Readonly<{ codesDepartement: ReadonlyArray<string>; type: 'departements' }>
  | Readonly<{ type: 'complet' }>

export type TerritoiresTrouvesReadModel = Readonly<{
  territoires: ReadonlyArray<UnTerritoireTrouveReadModel>
  total: number
}>

export type UnTerritoireTrouveReadModel = Readonly<{
  code: string
  nom: string
  numeroDepartement: null | string
  type: TypeTerritoire
}>

export type TypeTerritoire = 'departement' | 'epci' | 'region'

type Query = Readonly<{
  perimetre: PerimetreRechercheTerritoires
  terme: string
}>
