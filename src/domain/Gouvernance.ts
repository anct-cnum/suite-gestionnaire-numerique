import { Departement, DepartementState } from './Departement'
import { GestionnaireDepartement } from './GestionnaireDepartement'
import { Entity, Uid, ValueObject } from './shared/Model'
import { Utilisateur, UtilisateurUid } from './Utilisateur'
import { Result } from '@/shared/lang'

export class Gouvernance extends Entity<State> {
  override get state(): State {
    return {
      departement: this.#departement.state,
      noteDeContexte: this.#noteDeContexte?.state,
      notePrivee: this.#notePrivee?.state,
      uid: this.uid.state,
      membresCoporteurs: this.#membresCoporteurs,
    }
  }

  readonly #departement: Departement
  #noteDeContexte?: NoteDeContexte
  #notePrivee?: NotePrivee
  readonly #membresCoporteurs: MembreCoporteur[]

  private constructor(
    uid: GouvernanceUid,
    departement: Departement,
    noteDeContexte?: NoteDeContexte,
    notePrivee?: NotePrivee,
    membresCoporteurs: MembreCoporteur[] = []
  ) {
    super(uid)
    this.#departement = departement
    this.#noteDeContexte = noteDeContexte
    this.#notePrivee = notePrivee
    this.#membresCoporteurs = membresCoporteurs
  }

  static create({
    departement,
    noteDeContexte,
    notePrivee,
    uid,
    membresCoporteurs = [],
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
      notePriveeAjoutee,
      membresCoporteurs
    )
  }

  static laNotePriveePeutEtreGereePar(utilisateur: Utilisateur, codeDepartementGouvernance: string): boolean {
    return utilisateur instanceof GestionnaireDepartement
      && codeDepartementGouvernance === utilisateur.state.departement.code
  }

  static peutEtreGereePar(utilisateur: Utilisateur, codeDepartement: string, membresCoporteurs: MembreCoporteur[] = []): boolean {
    // Administrateurs peuvent toujours gérer
    if (utilisateur.isSuperAdmin || utilisateur.isAdmin) {
      return true
    }

    // Gestionnaire département du même département peut gérer
    if (codeDepartement === utilisateur.state.departement?.code) {
      return true
    }

    // Gestionnaire structure dont la structure est membre co-porteur peut gérer
    const structureUid = utilisateur.state.structureUid?.value
    if (structureUid !== undefined) {
      const membreCoporteur = membresCoporteurs.find(membre =>
        membre.structureUid === structureUid
      )
      // isCoporteur doit être explicitement true (undefined = false par défaut)
      if (membreCoporteur && membreCoporteur.isCoporteur === true) {
        return true
      }
    }

    return false
  }

  ajouterNoteDeContexte(noteDeContexte: NoteDeContexte): Result<GouvernanceFailure> {
    if (this.#noteDeContexte === undefined) {
      this.#noteDeContexte = noteDeContexte
      return 'OK'
    }
    return 'noteDeContexteDejaExistante'
  }

  ajouterNotePrivee(notePrivee: NotePrivee): Result<GouvernanceFailure> {
    if (this.#notePrivee === undefined) {
      this.#notePrivee = notePrivee
      return 'OK'
    }

    return 'notePriveeDejaExistante'
  }

  laNotePriveePeutEtreGereePar(utilisateur: Utilisateur): boolean {
    return Gouvernance.laNotePriveePeutEtreGereePar(utilisateur, this.#departement.state.code)
  }

  modifierNoteDeContexte(noteDeContexte: NoteDeContexte): Result<GouvernanceFailure> {
    if (this.#noteDeContexte !== undefined) {
      this.#noteDeContexte = noteDeContexte
      return 'OK'
    }

    return 'noteDeContexteInexistante'
  }

  modifierNotePrivee(notePrivee: NotePrivee): Result<GouvernanceFailure> {
    if (this.#notePrivee !== undefined) {
      this.#notePrivee = notePrivee
      return 'OK'
    }

    return 'notePriveeInexistante'
  }

  peutEtreGereePar(utilisateur: Utilisateur): boolean {
    return Gouvernance.peutEtreGereePar(utilisateur, this.#departement.state.code, this.#membresCoporteurs)
  }

  supprimerNoteDeContexte(): void {
    this.#noteDeContexte = undefined
  }

  supprimerNotePrivee(): void {
    this.#notePrivee = undefined
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

export type GouvernanceFailure = 'noteDeContexteDejaExistante' | 'noteDeContexteInexistante' | 'notePriveeDejaExistante' | 'notePriveeInexistante'

type MembreCoporteur = Readonly<{
  structureUid: number
  isCoporteur?: boolean
}>

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
  membresCoporteurs?: MembreCoporteur[]
}>

type State = Readonly<{
  departement: DepartementState
  noteDeContexte?: NoteDeContexteState
  notePrivee?: NotePriveeState
  uid: GouvernanceUidState
  membresCoporteurs: MembreCoporteur[]
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
