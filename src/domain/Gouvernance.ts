import { Just, Maybe, Nothing } from 'purify-ts'

import { Entity, Uid, ValueObject } from './shared/Model'
import { UtilisateurUid } from './Utilisateur'

export class Gouvernance extends Entity<GouvernanceState> {
  #noteDeContexte: Maybe<NoteDeContexte> = Nothing

  private constructor(uid: GouvernanceUid, noteDeContexte?: NoteDeContexte) {
    super(uid)
    this.#noteDeContexte = Maybe.fromNullable(noteDeContexte)
  }

  override get state(): GouvernanceState {
    return {
      noteDeContexte: this.#noteDeContexte.extract()?.state,
      uid: this.uid.state,
    }
  }

  static create({
    dateDeModificationNoteDeContexte,
    noteDeContexte,
    uidUtilisateurAyantModifieNoteDeContexte,
    uid,
  }: FactoryParams): Gouvernance {
    return new Gouvernance(
      new GouvernanceUid(uid),
      new NoteDeContexte(
        dateDeModificationNoteDeContexte,
        uidUtilisateurAyantModifieNoteDeContexte,
        noteDeContexte
      )
    )
  }

  ajouterNoteDeContexte(noteDeContexte: NoteDeContexte): void {
    this.#noteDeContexte = Just(noteDeContexte)
  }
}

export class GouvernanceUid extends Uid<GouvernanceUidState> {
  constructor(value: string) {
    super({ value })
  }
}

export class NoteDeContexte extends ValueObject<NoteDeContexteState> {
  constructor(
    dateDeModification: Date,
    uidUtilisateurAyantModifie: UtilisateurUid,
    value: string
  ) {
    super({
      dateDeModification: dateDeModification.toJSON(),
      uidUtilisateurAyantModifie: uidUtilisateurAyantModifie.state.value,
      value,
    })
  }
}

type GouvernanceState = Readonly<{
  noteDeContexte?: NoteDeContexteState
  uid: GouvernanceUidState
}>

type FactoryParams = Readonly<{
  dateDeModificationNoteDeContexte: Date
  noteDeContexte: string
  uidUtilisateurAyantModifieNoteDeContexte: UtilisateurUid
  uid: string
}>

type NoteDeContexteState = Readonly<{
  dateDeModification: string
  uidUtilisateurAyantModifie: string
  value: string
 }>

type GouvernanceUidState = Readonly<{ value: string }>
