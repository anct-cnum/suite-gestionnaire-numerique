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
  readonly #uidUtilisateurLAyantModifie: UtilisateurUid

  private constructor(
    uid: ComiteUid,
    dateDeCreation: ValidDate<ComiteFailure>,
    dateDeModification: ValidDate<ComiteFailure>,
    frequence: Frequence,
    type: Type,
    uidUtilisateurLAyantModifie: UtilisateurUid,
    commentaire?: string,
    date?: ValidDate<ComiteFailure>
  ) {
    super(uid)
    this.#commentaire = commentaire
    this.#date = date
    this.#dateDeCreation = dateDeCreation
    this.#dateDeModification = dateDeModification
    this.#frequence = frequence
    this.#type = type
    this.#uidUtilisateurLAyantModifie = uidUtilisateurLAyantModifie
  }

  override get state(): State {
    return {
      commentaire: this.#commentaire,
      date: this.#date?.toJSON(),
      dateDeCreation: this.#dateDeCreation.toJSON(),
      dateDeModification: this.#dateDeModification.toJSON(),
      frequence: this.#frequence.state.value,
      type: this.#type.state.value,
      uid: this.uid.state,
      uidUtilisateurLAyantModifie: this.#uidUtilisateurLAyantModifie.state.value,
    }
  }

  // eslint-disable-next-line sonarjs/function-return-type
  static create({
    uid,
    dateDeCreation,
    dateDeModification,
    frequence,
    type,
    uidUtilisateurCourant,
    commentaire,
    date,
  }: ComiteFactoryParams): Result<ComiteFailure, Comite> {
    try {
      const dateDeCreationValidee = new ValidDate(dateDeCreation, 'dateDeCreationInvalide')
      const dateDuComiteValidee = date === undefined ? undefined : new ValidDate(date, 'dateDuComiteInvalide')

      const comite = new Comite(
        new ComiteUid(uid),
        dateDeCreationValidee,
        new ValidDate(dateDeModification, 'dateDeModificationInvalide'),
        new Frequence(frequence),
        new Type(type),
        new UtilisateurUid(uidUtilisateurCourant),
        commentaire,
        dateDuComiteValidee
      )

      if (date !== undefined) {
        // @ts-expect-error
        validerQueLadateDuComiteDoitEtreDansLeFutur(dateDuComiteValidee, dateDeCreationValidee)
      }

      return comite
    } catch (error: unknown) {
      return (error as Exception<ComiteFailure>).message as ComiteFailure
    }
  }
}

export class ComiteUid extends Uid<ComiteUidState> {
  constructor(value: string) {
    super({ value })
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

const Frequences = ['Mensuelle', 'Trimestrielle', 'Semestrielle', 'Annuelle']

const Types = ['Stratégique', 'Technique', 'Consultatif', 'Autre']

type ComiteFactoryParams = Readonly<{
  uid: string
  dateDeCreation: Date
  dateDeModification: Date
  frequence: string
  type: string
  uidUtilisateurCourant: UtilisateurUidState
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
  uidUtilisateurLAyantModifie: string
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
