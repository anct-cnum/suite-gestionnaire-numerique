import { GouvernanceUid, GouvernanceUidState } from './Gouvernance'
import { Exception } from './shared/Exception'
import { Entity, Uid, ValueObject } from './shared/Model'
import { ValidDate } from './shared/ValidDate'
import { UtilisateurUid, UtilisateurUidState } from './Utilisateur'
import { Result } from '@/shared/lang'

export class Comite extends Entity<State> {
  readonly #commentaire?: string
  readonly #date?: ValidDate<ComiteFailure>
  readonly #dateDeCreation: ValidDate<ComiteFailure>
  readonly #dateDeModification: ValidDate<ComiteFailure>
  readonly #frequence: Frequence
  readonly #type: Type
  readonly #uid: ComiteUid
  readonly #uidGouvernance: GouvernanceUid
  readonly #uidEditeur: UtilisateurUid

  private constructor(
    uid: ComiteUid,
    dateDeCreation: ValidDate<ComiteFailure>,
    dateDeModification: ValidDate<ComiteFailure>,
    frequence: Frequence,
    type: Type,
    uidGouvernance: GouvernanceUid,
    uidEditeur: UtilisateurUid,
    commentaire?: string,
    date?: ValidDate<ComiteFailure>
  ) {
    super(uid)
    this.#uid = uid
    this.#commentaire = commentaire
    this.#date = date
    this.#dateDeCreation = dateDeCreation
    this.#dateDeModification = dateDeModification
    this.#frequence = frequence
    this.#type = type
    this.#uidGouvernance = uidGouvernance
    this.#uidEditeur = uidEditeur
  }

  override get state(): State {
    return {
      commentaire: this.#commentaire,
      date: this.#date?.toJSON(),
      dateDeCreation: this.#dateDeCreation.toJSON(),
      dateDeModification: this.#dateDeModification.toJSON(),
      frequence: this.#frequence.state.value,
      type: this.#type.state.value,
      uid: this.#uid.state,
      uidEditeur: this.#uidEditeur.state.value,
      uidGouvernance: this.#uidGouvernance.state.value,
    }
  }

  static create({
    dateDeCreation,
    dateDeModification,
    frequence,
    type,
    uid,
    uidGouvernance,
    uidEditeur,
    commentaire,
    date,
  }: FactoryParams): Result<ComiteFailure, Comite> {
    try {
      const dateDeCreationValidee = new ValidDate(dateDeCreation, 'dateDeCreationInvalide')
      const dateDuComiteValidee = date === undefined ? undefined : new ValidDate(date, 'dateDuComiteInvalide')
      const dateDeModificationValidee = new ValidDate(dateDeModification, 'dateDeModificationInvalide')

      const comite = new Comite(
        new ComiteUid(uid.value),
        dateDeCreationValidee,
        dateDeModificationValidee,
        new Frequence(frequence),
        new Type(type),
        new GouvernanceUid(uidGouvernance.value),
        new UtilisateurUid(uidEditeur),
        commentaire,
        dateDuComiteValidee
      )

      if (date !== undefined) {
        // @ts-expect-error
        validerQueLadateDuComiteDoitEtreDansLeFutur(dateDuComiteValidee, dateDeModificationValidee)
      }

      return comite
    } catch (error: unknown) {
      return (error as Exception<ComiteFailure>).message as ComiteFailure
    }
  }
}

export type ComiteFailure =
  | 'dateDeCreationInvalide'
  | 'dateDuComiteInvalide'
  | 'dateDeModificationInvalide'
  | 'dateDuComiteDoitEtreDansLeFutur'
  | 'frequenceInvalide'
  | 'typeInvalide'

class Frequence extends ValueObject<AttributState> {
  constructor(value: string) {
    if (!frequences.includes(value)) {
      throw Exception.of<ComiteFailure>('frequenceInvalide')
    }
    super({ value })
  }
}

class Type extends ValueObject<AttributState> {
  constructor(value: string) {
    if (!types.includes(value)) {
      throw Exception.of<ComiteFailure>('typeInvalide')
    }
    super({ value })
  }
}

class ComiteUid extends Uid<UidState> {
  constructor(value: string) {
    super({ value })
  }
}

const frequences = ['mensuelle', 'trimestrielle', 'semestrielle', 'annuelle']

const types = ['strategique', 'technique', 'consultatif', 'autre']

type FactoryParams = Readonly<{
  dateDeCreation: Date
  dateDeModification: Date
  frequence: string
  type: string
  uid: UidState
  uidGouvernance: GouvernanceUidState
  uidEditeur: UtilisateurUidState
  commentaire?: string
  date?: Date
}>

type State = Readonly<{
  commentaire?: string
  date?: string
  dateDeCreation: string
  dateDeModification: string
  frequence: string
  type: string
  uid: UidState
  uidGouvernance: string
  uidEditeur: string
}>

type AttributState = Readonly<{ value: string }>

type UidState = Readonly<{ value: string }>

function validerQueLadateDuComiteDoitEtreDansLeFutur(date: Date, dateDeCreation: Date): void | never {
  const dateDuComiteAComparer = Number(date.toISOString().split('T')[0].replaceAll('-', ''))
  const dateDeCreationAComparer = Number(dateDeCreation.toISOString().split('T')[0].replaceAll('-', ''))

  if (dateDuComiteAComparer < dateDeCreationAComparer) {
    throw Exception.of<ComiteFailure>('dateDuComiteDoitEtreDansLeFutur')
  }
}
