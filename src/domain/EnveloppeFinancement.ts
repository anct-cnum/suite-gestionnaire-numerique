import { Exception } from './shared/Exception'
import { Entity, Uid } from './shared/Model'
import { ValidDate } from './shared/ValidDate'
import { Result } from '@/shared/lang'

export class EnveloppeFinancement extends Entity<State> {
  override get state(): State {
    return {
      dateDeDebut: this.#dateDeDebut.toJSON(),
      dateDeFin: this.#dateDeFin.toJSON(),
      libelle: this.#libelle,
      montant: this.#montant,
      uid: this.#uid.state,
    }
  }

  readonly #dateDeDebut: ValidDate<EnveloppeFinancementFailure>
  readonly #dateDeFin: ValidDate<EnveloppeFinancementFailure>
  readonly #libelle: string
  readonly #montant: number
  readonly #uid: EnveloppeFinancementUid

  private constructor(
    uid: EnveloppeFinancementUid,
    dateDeDebut: ValidDate<EnveloppeFinancementFailure>,
    dateDeFin: ValidDate<EnveloppeFinancementFailure>,
    libelle: string,
    montant: number
  ) {
    super(uid)
    this.#uid = uid
    this.#dateDeDebut = dateDeDebut
    this.#dateDeFin = dateDeFin
    this.#libelle = libelle
    this.#montant = montant
  }

  static create({
    dateDeDebut,
    dateDeFin,
    libelle,
    montant,
    uid,
  }: FactoryParams): Result<EnveloppeFinancementFailure, EnveloppeFinancement> {
    try {
      const dateDeDebutValidee = new ValidDate(dateDeDebut, 'dateDeDebutInvalide')
      const dateDeFinValidee = new ValidDate(dateDeFin, 'dateDeFinInvalide')

      if (montant <= 0) {
        return 'montantInvalide'
      }

      return new EnveloppeFinancement(
        new EnveloppeFinancementUid(uid.value),
        dateDeDebutValidee,
        dateDeFinValidee,
        libelle,
        montant
      )
    }
    catch (error) {
      return (error as Exception<EnveloppeFinancementFailure>).message as EnveloppeFinancementFailure
    }
  }
}

export type EnveloppeFinancementFailure = 'dateDeDebutInvalide' | 'dateDeFinInvalide' | 'montantInvalide'

export class EnveloppeFinancementUid extends Uid<UidState> {
  constructor(value: string) {
    super({ value })
  }
}

type FactoryParams = Readonly<{
  dateDeDebut: Date
  dateDeFin: Date
  libelle: string
  montant: number
  uid: UidState
}>

type State = Readonly<{
  dateDeDebut: string
  dateDeFin: string
  libelle: string
  montant: number
  uid: UidState
}>

type UidState = Readonly<{ value: string }>
