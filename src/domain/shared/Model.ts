import { Struct } from '@/shared/lang'

abstract class Model {
  abstract get state(): Struct

  equals(other: this): boolean {
    return JSON.stringify(other.state) === JSON.stringify(this.state)
  }
}

export abstract class ValueObject<State extends Struct> extends Model {
  override get state(): State {
    return this.#state
  }

  readonly #state: State

  constructor(state: State) {
    super()
    this.#state = state
    Object.freeze(this)
  }
}

export abstract class Uid<State extends UidState> extends ValueObject<State> {}

export abstract class Entity<State extends EntityState> extends Model {
  abstract override get state(): State

  protected readonly uid: Uid<State['uid']>

  protected constructor(uid: Uid<State['uid']>) {
    super()
    this.uid = uid
  }
}

type EntityState = Readonly<{ uid: UidState }> & Struct

type UidState = Readonly<{ value: number | string }> & Struct
