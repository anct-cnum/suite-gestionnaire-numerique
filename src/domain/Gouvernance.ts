import { ComiteUid } from './Comite'
import { Entity, Uid, ValueObject } from './shared/Model'
import { Utilisateur, UtilisateurUid, UtilisateurUidState } from './Utilisateur'

export class Gouvernance extends Entity<State> {
  #noteDeContexte?: NoteDeContexte
  readonly #comites: Array<ComiteUid>
  readonly #uidUtilisateur: UtilisateurUid

  private constructor(
    uid: GouvernanceUid,
    uidUtilisateur: UtilisateurUid,
    noteDeContexte?: NoteDeContexte,
    comites?: ReadonlyArray<ComiteUid>
  ) {
    super(uid)
    this.#comites = [...comites ?? []]
    this.#noteDeContexte = noteDeContexte
    this.#uidUtilisateur = uidUtilisateur
  }

  override get state(): State {
    return {
      comites: this.#comites.map((comite) => comite.state.value),
      noteDeContexte: this.#noteDeContexte?.state,
      uid: this.uid.state,
      utilisateurUid: this.#uidUtilisateur.state,
    }
  }

  static create({
    comites,
    noteDeContexte,
    uid,
    utilisateurUid: utilisateur,
  }: GouvernanceFactoryParams): Gouvernance {
    const noteDeContexteAjoutee = noteDeContexte
      ? new NoteDeContexte(
        noteDeContexte.dateDeModification,
        noteDeContexte.uidUtilisateurLAyantModifiee,
        noteDeContexte.contenu
      )
      : undefined

    return new Gouvernance(
      new GouvernanceUid(uid),
      new UtilisateurUid({ email: utilisateur.email, value: utilisateur.value }),
      noteDeContexteAjoutee,
      comites
    )
  }

  ajouterNoteDeContexte(noteDeContexte: NoteDeContexte): void {
    this.#noteDeContexte = noteDeContexte
  }

  ajouterComite(comite: ComiteUid): void {
    this.#comites.push(comite)
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
      uidUtilisateurAyantModifiee: uidUtilisateurAyantModifie.state.value,
      value,
    })
  }
}

export type GouvernanceFactoryParams = Readonly<{
  comites?: ReadonlyArray<ComiteUid>
  noteDeContexte?: Readonly<{
    contenu: string
    dateDeModification: Date
    uidUtilisateurLAyantModifiee: UtilisateurUid
  }>
  uid: string
  utilisateurUid: {
    email: string
    value: string
  }
}>

type State = Readonly<{
  comites?: ReadonlyArray<string>
  noteDeContexte?: NoteDeContexteState
  uid: GouvernanceUidState
  utilisateurUid: UtilisateurUidState
}>

type NoteDeContexteState = Readonly<{
  dateDeModification: string
  uidUtilisateurAyantModifiee: string
  value: string
}>

type GouvernanceUidState = Readonly<{ value: string }>
