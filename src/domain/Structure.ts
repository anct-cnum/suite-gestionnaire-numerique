import { Entity, Uid } from './shared/Model'

export class Structure extends Entity<StructureState> {
  readonly #nom: string

  constructor(uid: StructureUid, nom: string) {
    super(uid)
    this.#nom = nom
  }

  state(): StructureState {
    return {
      nom: this.#nom,
      uid: this.uid.state(),
    }
  }
}

export type StructureState = Readonly<{
  uid: StructureUidState
  nom: string
}>

class StructureUid extends Uid<StructureUidState> {}

type StructureUidState = Readonly<{ value: number }>

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
