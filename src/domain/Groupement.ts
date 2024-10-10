import { Model } from './shared/Model'

export class Groupement extends Model<GroupementState> {
  readonly #id: number
  readonly #nom: string

  constructor(id: number, nom: string) {
    super()
    this.#id = id
    this.#nom = nom
  }

  state(): GroupementState {
    return {
      id: this.#id,
      nom: this.#nom,
    }
  }
}

export type GroupementState = Readonly<{
  id: number
  nom: string
}>
