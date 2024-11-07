import { Struct } from '@/shared/lang'

export abstract class Model<State extends Struct> {
  equals(other: Model<State>): boolean {
    return this.#isSameType(other) && this.#stateEquals(other)
  }

  #isSameType(other: Model<State>): boolean {
    return other instanceof this.constructor
  }

  #stateEquals(other: Model<State>): boolean {
    return JSON.stringify(other.state()) === JSON.stringify(this.state())
  }

  abstract state(): State
}

export abstract class Entity<State extends EntityState> extends Model<State> {
  protected readonly uid: State['uid']

  protected constructor(uid: State['uid']) {
    super()
    this.uid = uid
  }
}

type RawUid = string | number;

type EntityState = Readonly<{ uid: RawUid }> & Struct;
