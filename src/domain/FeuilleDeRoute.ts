import { GouvernanceUid, GouvernanceUidState } from './Gouvernance'
import { MembreUid } from './Membre'
import { Exception } from './shared/Exception'
import { Entity, Uid, ValueObject } from './shared/Model'
import { ValidDate } from './shared/ValidDate'
import { Utilisateur, UtilisateurUid, UtilisateurUidState } from './Utilisateur'
import { Result } from '@/shared/lang'

export class FeuilleDeRoute extends Entity<State> {
  override get state(): State {
    return {
      dateDeCreation: this.#dateDeCreation.toJSON(),
      dateDeModification: this.#dateDeModification.toJSON(),
      nom: this.#nom,
      noteDeContextualisation: this.#noteDeContextualisation?.state,
      perimetreGeographique: this.#perimetreGeographique,
      uid: this.#uid.state,
      uidEditeur: this.#uidEditeur.state.value,
      uidGouvernance: this.#uidGouvernance.state.value,
      uidPorteur: this.#uidPorteur.state.value,
    }
  }

  readonly #dateDeCreation: Date
  readonly #dateDeModification: Date
  readonly #nom: string
  #noteDeContextualisation?: NoteDeContextualisation
  readonly #perimetreGeographique: PerimetreGeographiqueTypes
  readonly #uid: FeuilleDeRouteUid
  readonly #uidEditeur: UtilisateurUid
  readonly #uidGouvernance: GouvernanceUid
  readonly #uidPorteur: MembreUid

  private constructor(
    uid: FeuilleDeRouteUid,
    nom: string,
    perimetreGeographique: PerimetreGeographiqueTypes,
    uidPorteur: MembreUid,
    uidEditeur: UtilisateurUid,
    uidGouvernance: GouvernanceUid,
    dateDeCreation: Date,
    dateDeModification: Date,
    noteDeContextualisation?: NoteDeContextualisation
  ) {
    super(uid)
    this.#uid = uid
    this.#nom = nom
    this.#perimetreGeographique = perimetreGeographique
    this.#uidPorteur = uidPorteur
    this.#uidEditeur = uidEditeur
    this.#uidGouvernance = uidGouvernance
    this.#dateDeCreation = dateDeCreation
    this.#dateDeModification = dateDeModification
    this.#noteDeContextualisation = noteDeContextualisation
  }

  static create({
    dateDeCreation,
    dateDeModification,
    nom,
    noteDeContextualisation,
    perimetreGeographique,
    uid,
    uidEditeur,
    uidGouvernance,
    uidPorteur,
  }: {
    dateDeCreation: Date
    dateDeModification: Date
    nom: string
    noteDeContextualisation?: Readonly<{
      contenu: string
      dateDeModification: Date
      uidEditeur: UtilisateurUid
    }>
    perimetreGeographique: PerimetreGeographiqueTypes
    uid: UidState
    uidEditeur: UtilisateurUidState
    uidGouvernance: GouvernanceUidState
    uidPorteur: string
  }): Result<FeuilleDeRouteFailure, FeuilleDeRoute> {
    try {
      const dateDeModificationValidee = new ValidDate(dateDeModification, 'dateDeModificationInvalide')
      const dateDeCreationValidee = new ValidDate(dateDeCreation, 'dateDeCreationInvalide')
      const validPerimetres: Array<PerimetreGeographiqueTypes> = Types
      if (!validPerimetres.includes(perimetreGeographique)) {
        return 'perimetreGeographiqueInvalide'
      }
      const noteDeContextualisationAjoutee = noteDeContextualisation
        ? new NoteDeContextualisation(
          noteDeContextualisation.dateDeModification,
          noteDeContextualisation.uidEditeur,
          noteDeContextualisation.contenu
        )
        : undefined
      return new FeuilleDeRoute(
        new FeuilleDeRouteUid(uid.value),
        nom,
        perimetreGeographique,
        new MembreUid(uidPorteur),
        new UtilisateurUid(uidEditeur),
        new GouvernanceUid(uidGouvernance.value),
        dateDeCreationValidee,
        dateDeModificationValidee,
        noteDeContextualisationAjoutee
      )
    }
    catch (error: unknown) {
      return (error as Exception<FeuilleDeRouteFailure>).message as FeuilleDeRouteFailure
    }
  }

  ajouterUneNoteDeContextualisation(noteDeContextualisation: NoteDeContextualisation): Result<FeuilleDeRouteFailure> {
    if (this.#noteDeContextualisation !== undefined) {
      return 'noteDeContextualisationDejaExistante'
    }
    this.#noteDeContextualisation = noteDeContextualisation
    return 'OK'
  }

  modifierUneNoteDeContextualisation(noteDeContextualisation: NoteDeContextualisation): Result<FeuilleDeRouteFailure> {
    if (this.#noteDeContextualisation !== undefined) {
      this.#noteDeContextualisation = noteDeContextualisation
      return 'OK'
    }

    return 'noteDeContextualisationInexistante'
  }

  peutEtreGereePar(utilisateur: Utilisateur): boolean {
    return utilisateur.isAdmin
      || this.#uidGouvernance.state.value === utilisateur.state.departement?.code
      || this.#uidGouvernance.state.value === utilisateur.state.region?.code
  }
}

const Types = [
  'departemental',
  'groupementsDeCommunes',
  'regional',
]

export type PerimetreGeographiqueTypes = typeof Types[number]

export type FeuilleDeRouteFailure = 'dateDeModificationInvalide' | 'noteDeContextualisationDejaExistante' | 'noteDeContextualisationInexistante' | 'perimetreGeographiqueInvalide' | 'utilisateurNePeutPasModifierNoteDeContextualisation'

export class FeuilleDeRouteUid extends Uid<UidState> {
  constructor(value: string) {
    super({ value })
  }
}

export class NoteDeContextualisation extends ValueObject<NoteDeContextualisationState> {
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

type UidState = Readonly<{ value: string }>

type NoteDeContextualisationState = Readonly<{
  dateDeModification: string
  uidEditeur: string
  value: string
}>

type State = Readonly<{
  dateDeCreation: string
  dateDeModification: string
  nom: string
  noteDeContextualisation?: NoteDeContextualisationState
  perimetreGeographique: string
  uid: UidState
  uidEditeur: string
  uidGouvernance: string
  uidPorteur: string
}>
