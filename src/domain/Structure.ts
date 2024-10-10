import { Model } from './shared/Model'

export class Structure extends Model<StructureState> {
  readonly #id: number
  readonly #nom: string

  constructor(id: number, nom: string) {
    super()
    this.#id = id
    this.#nom = nom
  }

  state(): StructureState {
    return {
      id: this.#id,
      nom: this.#nom,
    }
  }
}

export type StructureState = Readonly<{
  id: number
  nom: string
}>
