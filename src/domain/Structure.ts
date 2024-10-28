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

const Types = [
  'COLLECTIVITE',
  'COMMUNE',
  'DEPARTEMENT',
  'EPCI',
  'GIP',
  'PRIVATE',
  'REGION',
] as const

export type TypologieType = (typeof Types)[number]

const Statuts = [
  'ABANDON',
  'ANNULEE',
  'CREEE',
  'DOUBLON',
  'EXAMEN_COMPLEMENTAIRE_COSELEC',
  'REFUS_COORDINATEUR',
  'REFUS_COSELEC',
  'VALIDATION_COSELEC',
] as const

export type TypologieStatut = (typeof Statuts)[number]
