import { QueryHandler } from '../QueryHandler'

export class RechercherLesStructures implements QueryHandler<Query, StructuresReadModel> {
  readonly #structureLoader: StructureLoader

  constructor(structureLoader: StructureLoader) {
    this.#structureLoader = structureLoader
  }

  async handle(query: Query): Promise<StructuresReadModel> {
    switch (query.zone?.type) {
      case 'departement':
        return this.#structureLoader.structuresByDepartement(query.match, query.zone.code)
      case 'region':
        return this.#structureLoader.structuresByRegion(query.match, query.zone.code)
      default:
        return this.#structureLoader.structures(query.match)
    }
  }
}

export interface StructureLoader {
  structures(match: string): Promise<StructuresReadModel>
  structuresByDepartement(match: string, codeDepartement: string): Promise<StructuresReadModel>
  structuresByRegion(match: string, codeRegion: string): Promise<StructuresReadModel>
}

export type StructuresReadModel = ReadonlyArray<UneStructureReadModel>

export type UneStructureReadModel = Readonly<{
  commune: string
  isMembre: boolean
  nom: string
  uid: string
}>

type TypeZone = 'departement' | 'region'

type Query = Readonly<{
  match: string
  zone?: Readonly<{
    code: string
    type: TypeZone
  }>
}>
