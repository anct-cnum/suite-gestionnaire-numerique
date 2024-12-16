import { Exception } from './shared/Exception'
import { Entity, Uid, ValueObject } from './shared/Model'
import { UtilisateurUid, UtilisateurUidState } from './Utilisateur'
import { Result } from '@/shared/lang'

export class Comite extends Entity<State> {
  readonly #commentaire?: string
  readonly #date?: DateDuComite
  readonly #dateDeCreation: DateDeCreation
  readonly #dateDeModification: DateDeModification
  readonly #frequence: Frequence
  readonly #type: Type
  readonly #uidUtilisateurLAyantModifie: UtilisateurUid

  private constructor(
    uid: ComiteUid,
    dateDeCreation: DateDeCreation,
    dateDeModification: DateDeModification,
    frequence: Frequence,
    type: Type,
    uidUtilisateurLAyantModifie: UtilisateurUid,
    commentaire?: string,
    date?: DateDuComite
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
      date: this.#date?.state.value,
      dateDeCreation: this.#dateDeCreation.state.value,
      dateDeModification: this.#dateDeModification.state.value,
      frequence: this.#frequence.state.value,
      type: this.#type.state.value,
      uid: this.uid.state,
      uidUtilisateurLAyantModifie: this.#uidUtilisateurLAyantModifie.state.value,
    }
  }

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
      const dateDeCreationValidee = new DateDeCreation(dateDeCreation)
      const dateDuComiteValidee = date !== undefined ? new DateDuComite(date) : undefined

      const comite = new Comite(
        new ComiteUid(uid),
        dateDeCreationValidee,
        new DateDeModification(dateDeModification),
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

export type ComiteFactoryParams = Readonly<{
  uid: string
  dateDeCreation: string
  dateDeModification: string
  frequence: string
  type: string
  uidUtilisateurCourant: UtilisateurUidState
  commentaire?: string
  date?: string
}>

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

class DateDuComite extends ValueObject<AttributGouvernanceState> {
  constructor(value: string) {
    if (isNaN(Date.parse(value))) {
      throw Exception.of<ComiteFailure>('dateDuComiteInvalide')
    }

    super({ value: new Date(value).toJSON() })
  }
}

class DateDeCreation extends ValueObject<AttributGouvernanceState> {
  constructor(value: string) {
    if (isNaN(Date.parse(value))) {
      throw Exception.of<ComiteFailure>('dateDeCreationInvalide')
    }
    super({ value: new Date(value).toJSON() })
  }
}

class DateDeModification extends ValueObject<AttributGouvernanceState> {
  constructor(value: string) {
    if (isNaN(Date.parse(value))) {
      throw Exception.of<ComiteFailure>('dateDeModificationInvalide')
    }
    super({ value: new Date(value).toJSON() })
  }
}

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

function validerQueLadateDuComiteDoitEtreDansLeFutur(date: DateDuComite, dateDeCreation: DateDeCreation): void | never {
  const dateDuComiteAComparer = Number(new Date(date.state.value).toISOString().split('T')[0].replaceAll('-', ''))
  const dateDeCreationAComparer = Number(new Date(dateDeCreation.state.value).toISOString().split('T')[0].replaceAll('-', ''))

  if (dateDuComiteAComparer < dateDeCreationAComparer) {
    throw Exception.of<ComiteFailure>('dateDuComiteDoitEtreDansLeFutur')
  }
}
