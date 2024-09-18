export interface Model {
  state: () => Readonly<Record<string, unknown>>
}

export abstract class Entity<Uid> implements Model {
  protected readonly uid: Uid

  protected constructor(uid: Uid) {
    this.uid = uid
  }

  abstract state(): Readonly<Record<string, unknown>>
}
