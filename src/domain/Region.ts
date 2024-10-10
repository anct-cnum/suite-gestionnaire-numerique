import { Model } from './shared/Model'

export class Region extends Model<RegionState> {
  readonly #code: string
  readonly #nom: string

  constructor(code: string, nom: string) {
    super()
    this.#code = code
    this.#nom = nom
  }

  state(): RegionState {
    return {
      code: this.#code,
      nom: this.#nom,
    }
  }
}

export type RegionState = Readonly<{
  code: string
  nom: string
}>
