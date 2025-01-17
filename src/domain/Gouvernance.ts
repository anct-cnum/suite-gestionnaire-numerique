import { Departement, DepartementState } from './Departement'
import { Entity, Uid, ValueObject } from './shared/Model'
import { Utilisateur, UtilisateurUid } from './Utilisateur'

export class Gouvernance extends Entity<State> {
  readonly #departement: Departement
  #noteDeContexte?: NoteDeContexte

  private constructor(
    uid: GouvernanceUid,
    departement: Departement,
    noteDeContexte?: NoteDeContexte
  ) {
    super(uid)
    this.#departement = departement
    this.#noteDeContexte = noteDeContexte
  }

  override get state(): State {
    return {
      departement: this.#departement.state,
      noteDeContexte: this.#noteDeContexte?.state,
      uid: this.uid.state,
    }
  }

  static create({
    noteDeContexte,
    uid,
    departement,
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
      new Departement(departement),
      noteDeContexteAjoutee
    )
  }

  ajouterNoteDeContexte(noteDeContexte: NoteDeContexte): void {
    this.#noteDeContexte = noteDeContexte
  }

  peutEtreGerePar(utilisateur: Utilisateur): boolean {
    return utilisateur.isAdmin
      || this.#departement.state.code === utilisateur.state.departement?.code
      || this.#departement.state.codeRegion === utilisateur.state.region?.code
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

export type GouvernanceUidState = Readonly<{ value: string }>

type GouvernanceFactoryParams = Readonly<{
  departement: {
    code: string
    codeRegion: string
    nom: string
  }
  noteDeContexte?: Readonly<{
    contenu: string
    dateDeModification: Date
    uidUtilisateurLAyantModifiee: UtilisateurUid
  }>
  uid: string
}>

type State = Readonly<{
  departement: DepartementState
  noteDeContexte?: NoteDeContexteState
  uid: GouvernanceUidState
}>

type NoteDeContexteState = Readonly<{
  dateDeModification: string
  uidUtilisateurAyantModifiee: string
  value: string
}>

