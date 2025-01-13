import { Departement, DepartementState } from './Departement'
import { Entity, Uid, ValueObject } from './shared/Model'
import { Utilisateur, UtilisateurUid, UtilisateurUidState } from './Utilisateur'

export class Gouvernance extends Entity<State> {
  readonly #departement: Departement
  #noteDeContexte?: NoteDeContexte
  readonly #uidUtilisateur: UtilisateurUid

  private constructor(
    uid: GouvernanceUid,
    uidUtilisateur: UtilisateurUid,
    departement: Departement,
    noteDeContexte?: NoteDeContexte
  ) {
    super(uid)
    this.#departement = departement
    this.#noteDeContexte = noteDeContexte
    this.#uidUtilisateur = uidUtilisateur
  }

  override get state(): State {
    return {
      departement: this.#departement.state,
      noteDeContexte: this.#noteDeContexte?.state,
      uid: this.uid.state,
      utilisateurUid: this.#uidUtilisateur.state,
    }
  }

  static create({
    noteDeContexte,
    uid,
    utilisateurUid,
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
      new UtilisateurUid({ email: utilisateurUid.email, value: utilisateurUid.value }),
      new Departement(departement),
      noteDeContexteAjoutee
    )
  }

  ajouterNoteDeContexte(noteDeContexte: NoteDeContexte): void {
    this.#noteDeContexte = noteDeContexte
  }

  peutEtreGererPar(utilisateur: Utilisateur): boolean {
    return this.#departement.state.code === utilisateur.state.departement?.code || utilisateur.isAdmin
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
  utilisateurUid: {
    email: string
    value: string
  }
}>

type State = Readonly<{
  departement: DepartementState
  noteDeContexte?: NoteDeContexteState
  uid: GouvernanceUidState
  utilisateurUid: UtilisateurUidState
}>

type NoteDeContexteState = Readonly<{
  dateDeModification: string
  uidUtilisateurAyantModifiee: string
  value: string
}>

