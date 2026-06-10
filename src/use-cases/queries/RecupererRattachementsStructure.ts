import { QueryHandler } from '../QueryHandler'

// Compte les éléments qui pointent vers une structure_administrative (FK). Sert à prévenir
// l'administrateur des conséquences d'un renommage / d'une future fusion.
export class RecupererRattachementsStructure implements QueryHandler<Query, RattachementsStructureReadModel> {
  readonly #loader: RattachementsStructureLoader

  constructor(loader: RattachementsStructureLoader) {
    this.#loader = loader
  }

  async handle(query: Query): Promise<RattachementsStructureReadModel> {
    return this.#loader.compter(query.structureId)
  }
}

export interface RattachementsStructureLoader {
  compter(structureId: number): Promise<RattachementsStructureReadModel>
}

export type RattachementsStructureReadModel = Readonly<{
  affectations: number
  contacts: number
  contrats: number
  lieux: number
  membres: number
  postes: number
  utilisateurs: number
}>

type Query = Readonly<{
  structureId: number
}>
