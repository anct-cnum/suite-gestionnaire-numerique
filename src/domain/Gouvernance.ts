import { Entity, Uid, ValueObject } from './shared/Model'
import { UtilisateurUid } from './Utilisateur'

export class Gouvernance extends Entity<GouvernanceState> {
  #noteDeContexte?: NoteDeContexte

  private constructor(uid: GouvernanceUid, noteDeContexte?: NoteDeContexte) {
    super(uid)
    this.#noteDeContexte = noteDeContexte
  }

  override get state(): GouvernanceState {
    return {
      noteDeContexte: this.#noteDeContexte?.state,
      uid: this.uid.state,
    }
  }

  static create({
    noteDeContexte,
    uid,
  }: FactoryParams): Gouvernance {
    const noteDeContexteAjoutee = noteDeContexte
      ? new NoteDeContexte(
        noteDeContexte.dateDeModificationNoteDeContexte,
        noteDeContexte.uidUtilisateurAyantModifieNoteDeContexte,
        noteDeContexte.contenu
      )
      : undefined

    return new Gouvernance(
      new GouvernanceUid(uid),
      noteDeContexteAjoutee
    )
  }

  ajouterNoteDeContexte(noteDeContexte: NoteDeContexte): void {
    this.#noteDeContexte = noteDeContexte
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

export type FactoryParams = Readonly<{
  noteDeContexte?: Readonly<{
    contenu: string
    dateDeModificationNoteDeContexte: Date
    uidUtilisateurAyantModifieNoteDeContexte: UtilisateurUid
  }>
  uid: string
}>

type NoteDeContexteState = Readonly<{
  dateDeModification: string
  uidUtilisateurAyantModifie: string
  value: string
 }>

type GouvernanceUidState = Readonly<{ value: string }>
