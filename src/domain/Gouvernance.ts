import { Departement, DepartementState } from './Departement'
import { Entity, Uid, ValueObject } from './shared/Model'
import { Utilisateur, UtilisateurUid } from './Utilisateur'
import { Result } from '@/shared/lang'

export class Gouvernance extends Entity<State> {
  readonly #departement: Departement
  #noteDeContexte?: NoteDeContexte
  #notePrivee?: NotePrivee

  private constructor(
    uid: GouvernanceUid,
    departement: Departement,
    noteDeContexte?: NoteDeContexte,
    notePrivee?: NotePrivee
  ) {
    super(uid)
    this.#departement = departement
    this.#noteDeContexte = noteDeContexte
    this.#notePrivee = notePrivee
  }

  override get state(): State {
    return {
      departement: this.#departement.state,
      noteDeContexte: this.#noteDeContexte?.state,
      notePrivee: this.#notePrivee?.state,
      uid: this.uid.state,
    }
  }

  static create({
    noteDeContexte,
    notePrivee,
    uid,
    departement,
  }: GouvernanceFactoryParams): Gouvernance {
    const noteDeContexteAjoutee = noteDeContexte
      ? new NoteDeContexte(
        noteDeContexte.dateDeModification,
        noteDeContexte.uidEditeur,
        noteDeContexte.contenu
      )
      : undefined

    const notePriveeAjoutee = notePrivee
      ? new NotePrivee(
        notePrivee.dateDeModification,
        notePrivee.uidEditeur,
        notePrivee.contenu
      )
      : undefined

    return new Gouvernance(
      new GouvernanceUid(uid),
      new Departement(departement),
      noteDeContexteAjoutee,
      notePriveeAjoutee
    )
  }

  ajouterNoteDeContexte(noteDeContexte: NoteDeContexte): Result<GouvernanceFailure> {
    if (this.#noteDeContexte === undefined) {
      this.#noteDeContexte = noteDeContexte
      return 'OK'
    }
    return 'noteDeContexteDejaExistante'
  }

  modifierNoteDeContexte(noteDeContexte: NoteDeContexte): Result<GouvernanceFailure> {
    if (this.#noteDeContexte !== undefined) {
      this.#noteDeContexte = noteDeContexte
      return 'OK'
    }

    return 'noteDeContexteInexistante'
  }

  ajouterNotePrivee(notePrivee: NotePrivee): Result<GouvernanceFailure> {
    if (this.#notePrivee === undefined) {
      this.#notePrivee = notePrivee
      return 'OK'
    }

    return 'notePriveeDejaExistante'
  }

  modifierNotePrivee(notePrivee: NotePrivee): Result<GouvernanceFailure> {
    if (this.#notePrivee !== undefined) {
      this.#notePrivee = notePrivee
      return 'OK'
    }

    return 'notePriveeInexistante'
  }

  peutEtreGerePar(utilisateur: Utilisateur): boolean {
    return utilisateur.isAdmin
      || this.#departement.state.code === utilisateur.state.departement?.code
      || this.#departement.state.codeRegion === utilisateur.state.region?.code
  }

  laNotePriveePeutEtreGerePar(utilisateur: Utilisateur): boolean {
    return this.#departement.state.code === utilisateur.state.departement?.code
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
    uidEditeur: UtilisateurUid,
    value: string
  ) {
    super({
      dateDeModification: dateDeModification.toJSON(),
      uidEditeur: uidEditeur.state.value,
      value,
    })
  }
}

export class NotePrivee extends ValueObject<NotePriveeState> {
  // eslint-disable-next-line sonarjs/no-identical-functions
  constructor(
    dateDeModification: Date,
    uidEditeur: UtilisateurUid,
    value: string
  ) {
    super({
      dateDeModification: dateDeModification.toJSON(),
      uidEditeur: uidEditeur.state.value,
      value,
    })
  }
}

export type GouvernanceUidState = Readonly<{ value: string }>

export type GouvernanceFailure = 'notePriveeDejaExistante' | 'notePriveeInexistante' | 'noteDeContexteDejaExistante' | 'noteDeContexteInexistante'

type GouvernanceFactoryParams = Readonly<{
  departement: {
    code: string
    codeRegion: string
    nom: string
  }
  noteDeContexte?: Readonly<{
    contenu: string
    dateDeModification: Date
    uidEditeur: UtilisateurUid
  }>
  notePrivee?: Readonly<{
    contenu: string
    dateDeModification: Date
    uidEditeur: UtilisateurUid
  }>
  uid: string
}>

type State = Readonly<{
  departement: DepartementState
  noteDeContexte?: NoteDeContexteState
  notePrivee?: NotePriveeState
  uid: GouvernanceUidState
}>

type NoteDeContexteState = Readonly<{
  dateDeModification: string
  uidEditeur: string
  value: string
}>

type NotePriveeState = Readonly<{
  dateDeModification: string
  uidEditeur: string
  value: string
}>

