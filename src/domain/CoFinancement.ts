import { ActionUid } from './Action'
import { MembreUid } from './Membre'
import { Exception } from './shared/Exception'
import { Entity, Uid } from './shared/Model'
import { Result } from '@/shared/lang'

// istanbul ignore next @preserve
export class CoFinancement extends Entity<State> {
  override get state(): State {
    return {
      montant: this.#montant,
      uid: this.#uid.state,
      uidAction: this.#uidAction.state.value,
      uidMembre: this.#uidMembre.state.value,
    }
  }

  readonly #montant: number
  readonly #uid: CoFinancementUid
  readonly #uidAction: ActionUid
  readonly #uidMembre: MembreUid

  private constructor(
    uid: CoFinancementUid,
    montant: number,
    uidAction: ActionUid,
    uidMembre: MembreUid
  ) {
    super(uid)
    this.#uid = uid
    this.#montant = montant
    this.#uidAction = uidAction
    this.#uidMembre = uidMembre
  }

  static create({
    montant,
    uid,
    uidAction,
    uidMembre,
  }: FactoryParams): Result<CoFinancementFailure, CoFinancement> {
    try {
      if (montant <= 0) {
        return 'montantInvalide'
      }

      return new CoFinancement(
        new CoFinancementUid(uid.value),
        montant,
        new ActionUid(uidAction.value),
        new MembreUid(uidMembre)
      )
    }
    catch (error) {
      return (error as Exception<CoFinancementFailure>).message as CoFinancementFailure
    }
  }

  avecNouvelleUidAction(uidAction: string): CoFinancement {
    return CoFinancement.create({
      montant: this.#montant,
      uid: this.#uid.state,
      uidAction: { value: uidAction },
      uidMembre: this.#uidMembre.state.value,
    }) as CoFinancement
  }
}

export type CoFinancementFailure = 'montantInvalide'

export class CoFinancementUid extends Uid<UidState> {
  constructor(value: string) {
    super({ value })
  }
}

type FactoryParams = Readonly<{
  montant: number
  uid: UidState
  uidAction: UidState
  uidMembre: string
}>

type State = Readonly<{
  montant: number
  uid: UidState
  uidAction: string
  uidMembre: string
}>

type UidState = Readonly<{ value: string }>
