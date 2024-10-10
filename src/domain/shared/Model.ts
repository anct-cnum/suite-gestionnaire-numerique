import { Struct } from '@/util/types'

export abstract class Model<S extends Struct> {
  equals(other: Model<S>): boolean {
    return this.#isSameType(other) && this.#stateEquals(other)
  }

  #isSameType(other: Model<S>): boolean {
    return other instanceof this.constructor
  }

  #stateEquals(other: Model<S>): boolean {
    return JSON.stringify(other.state()) === JSON.stringify(this.state())
  }

  abstract state(): S
}

export abstract class Entity<S extends EntityState> extends Model<S> {
  protected readonly uid: S['uid']

  protected constructor(uid: S['uid']) {
    super()
    this.uid = uid
  }
}

type RawUid = string | number;

type EntityState = Readonly<{ uid: RawUid }> & Struct;
