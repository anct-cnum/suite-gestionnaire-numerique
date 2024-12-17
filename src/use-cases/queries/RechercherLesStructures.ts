import { QueryHandler } from '../QueryHandler'

export class RechercherLesStructures implements QueryHandler<Query, StructuresReadModel> {
  readonly #structuresLoader: StructuresLoader

  constructor(structureLoader: StructuresLoader) {
    this.#structuresLoader = structureLoader
  }

  async get(query: Query): Promise<StructuresReadModel> {
    switch (query.zone?.type) {
      case 'departement':
        return this.#structuresLoader.findStructuresByDepartement(query.match, query.zone.code)
      case 'region':
        return this.#structuresLoader.findStructuresByRegion(query.match, query.zone.code)
      default:
        return this.#structuresLoader.findStructures(query.match)
    }
  }
}

export interface StructuresLoader {
  findStructures(match: string): Promise<StructuresReadModel>
  findStructuresByDepartement(match: string, codeDepartement: string): Promise<StructuresReadModel>
  findStructuresByRegion(match: string, codeRegion: string): Promise<StructuresReadModel>
}

export type StructuresReadModel = ReadonlyArray<UneStructureReadModel>

export type UneStructureReadModel = Readonly<{
  nom: string
  commune: string
  uid: string
}>

type TypeZone = 'departement' | 'region'

type Query = Readonly<{
  match: string,
  zone?: Readonly<{
    type: TypeZone,
    code: string
  }>
}>
