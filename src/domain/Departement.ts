import { Model } from './shared/Model'

export class Departement implements Model {
  readonly #code: string
  readonly #codeRegion: string
  readonly #nom: string

  constructor(code: string, codeRegion: string, nom: string) {
    this.#code = code
    this.#codeRegion = codeRegion
    this.#nom = nom
  }

  state(): DepartementState {
    return {
      code: this.#code,
      codeRegion: this.#codeRegion,
      nom: this.#nom,
    }
  }
}

export type DepartementState = Readonly<{
  code: string
  codeRegion: string
  nom: string
}>
