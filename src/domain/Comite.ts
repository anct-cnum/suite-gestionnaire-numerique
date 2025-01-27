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

  // eslint-disable-next-line sonarjs/function-return-type
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
  }: ComiteFactoryParams): Result<ComiteFailure, Comite> {
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

class Frequence extends ValueObject<AttributGouvernanceState> {
  constructor(value: string) {
    if (!Frequences.includes(value)) {
      throw Exception.of<ComiteFailure>('frequenceInvalide')
    }
    super({ value })
  }
}

class Type extends ValueObject<AttributGouvernanceState> {
  constructor(value: string) {
    if (!Types.includes(value)) {
      throw Exception.of<ComiteFailure>('typeInvalide')
    }
    super({ value })
  }
}

class ComiteUid extends Uid<ComiteUidState> {
  constructor(value: string) {
    super({ value })
  }
}

const Frequences = ['mensuelle', 'trimestrielle', 'semestrielle', 'annuelle']

const Types = ['strategique', 'technique', 'consultatif', 'autre']

type ComiteFactoryParams = Readonly<{
  dateDeCreation: Date
  dateDeModification: Date
  frequence: string
  type: string
  uid: ComiteUidState
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
  uid: ComiteUidState
  uidGouvernance: string
  uidEditeur: string
}>

type AttributGouvernanceState = Readonly<{ value: string }>

type ComiteUidState = Readonly<{ value: string }>

function validerQueLadateDuComiteDoitEtreDansLeFutur(date: Date, dateDeCreation: Date): void | never {
  const dateDuComiteAComparer = Number(date.toISOString().split('T')[0].replaceAll('-', ''))
  const dateDeCreationAComparer = Number(dateDeCreation.toISOString().split('T')[0].replaceAll('-', ''))

  if (dateDuComiteAComparer < dateDeCreationAComparer) {
    throw Exception.of<ComiteFailure>('dateDuComiteDoitEtreDansLeFutur')
  }
}
