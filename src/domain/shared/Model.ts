import { Struct } from '@/shared/lang'

abstract class Model {
  equals(other: this): boolean {
    return JSON.stringify(other.state()) === JSON.stringify(this.state())
  }

  abstract state(): Struct
}

export abstract class ValueObject<State extends Struct> extends Model {
  readonly #state: State

  constructor(state: State) {
    super()
    this.#state = state
    Object.freeze(this)
  }

  override state(): State {
    return this.#state
  }
}

export abstract class Uid<State extends UidState> extends ValueObject<State> {}

export abstract class Entity<State extends EntityState> extends Model {
  protected readonly uid: Uid<State['uid']>

  protected constructor(uid: Uid<State['uid']>) {
    super()
    this.uid = uid
  }

  abstract override state(): State
}

type EntityState = Readonly<{ uid: UidState }> & Struct

type UidState = Readonly<{value: string | number}> & Struct
