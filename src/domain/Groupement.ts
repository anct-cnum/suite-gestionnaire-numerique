import { Entity, Uid } from './shared/Model'

export class Groupement extends Entity<GroupementState> {
  readonly #nom: string

  constructor(uid: GroupementUid, nom: string) {
    super(uid)
    this.#nom = nom
  }

  state(): GroupementState {
    return {
      nom: this.#nom,
      uid: this.uid.state(),
    }
  }
}

export type GroupementState = Readonly<{
  uid: GroupementUidState
  nom: string
}>

type GroupementUidState = Readonly<{value: number, email: string}>

class GroupementUid extends Uid<GroupementUidState> {}
