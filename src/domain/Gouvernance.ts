import { Entity, Uid, ValueObject } from './shared/Model'
import { Utilisateur, UtilisateurUid, UtilisateurUidState } from './Utilisateur'

export class Gouvernance extends Entity<GouvernanceState> {
  #noteDeContexte?: NoteDeContexte
  readonly #uidUtilisateur: UtilisateurUid

  private constructor(
    uid: GouvernanceUid,
    uidUtilisateur: UtilisateurUid,
    noteDeContexte?: NoteDeContexte
  ) {
    super(uid)
    this.#noteDeContexte = noteDeContexte
    this.#uidUtilisateur = uidUtilisateur
  }

  override get state(): GouvernanceState {
    return {
      noteDeContexte: this.#noteDeContexte?.state,
      uid: this.uid.state,
      utilisateurUid: this.#uidUtilisateur.state,
    }
  }

  static create({
    noteDeContexte,
    uid,
    utilisateurUid: utilisateur,
  }: FactoryParams): Gouvernance {
    const noteDeContexteAjoutee = noteDeContexte
      ? new NoteDeContexte(
        noteDeContexte.dateDeModification,
        noteDeContexte.uidUtilisateurLAyantModifie,
        noteDeContexte.contenu
      )
      : undefined

    return new Gouvernance(
      new GouvernanceUid(uid),
      new UtilisateurUid({ email: utilisateur.email, value: utilisateur.value }),
      noteDeContexteAjoutee
    )
  }

  ajouterNoteDeContexte(noteDeContexte: NoteDeContexte): void {
    this.#noteDeContexte = noteDeContexte
  }

  peutSeFaireGerer(autre: Utilisateur): boolean {
    return autre.state.uid.value === this.#uidUtilisateur.state.value
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

export type GouvernanceState = Readonly<{
  noteDeContexte?: NoteDeContexteState
  uid: GouvernanceUidState
  utilisateurUid: UtilisateurUidState
}>

export type FactoryParams = Readonly<{
  noteDeContexte?: Readonly<{
    contenu: string
    dateDeModification: Date
    uidUtilisateurLAyantModifie: UtilisateurUid
  }>
  uid: string
  utilisateurUid: {
    email: string
    value: string
  }
}>

type NoteDeContexteState = Readonly<{
  dateDeModification: string
  uidUtilisateurAyantModifie: string
  value: string
 }>

type GouvernanceUidState = Readonly<{ value: string }>
