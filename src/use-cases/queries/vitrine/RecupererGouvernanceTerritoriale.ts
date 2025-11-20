import { QueryHandler } from '../../QueryHandler'

export class RecupererGouvernanceTerritoriale implements QueryHandler<Query, GouvernanceTerritorialeReadModel> {
  readonly #loader: GouvernanceTerritorialeLoader

  constructor(loader: GouvernanceTerritorialeLoader) {
    this.#loader = loader
  }

  async handle(query: Query): Promise<GouvernanceTerritorialeReadModel> {
    return this.#loader.get(query.codeDepartement)
  }
}

export interface GouvernanceTerritorialeLoader {
  get(codeDepartement: string): Promise<GouvernanceTerritorialeReadModel>
}

export type GouvernanceTerritorialeReadModel = Readonly<{
  membres: ReadonlyArray<MembreTerritorialReadModel>
  statistiques: Readonly<{
    feuilleDeRoute: Readonly<{
      action: number
      total: number
    }>
    membre: Readonly<{
      coporteur: number
      total: number
    }>
  }>
  territoire: string
}>

export type MembreTerritorialReadModel = Readonly<{
  categorie: string
  details: ReadonlyArray<
    Readonly<{
      information: string
      intitule: string
    }>
  >
  id: string
  nom: string
  roles: ReadonlyArray<RoleMembre>
  type: string
}>

export type RoleMembre = 'beneficiaire' | 'cofinanceur' | 'coporteur' | 'recipiendaire'

type Query = Readonly<{
  codeDepartement: string
}>
