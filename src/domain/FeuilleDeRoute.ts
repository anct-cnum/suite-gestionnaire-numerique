import { GouvernanceUid, GouvernanceUidState } from './Gouvernance'
import { MembreUid } from './Membre'
import { Exception } from './shared/Exception'
import { Entity, Uid } from './shared/Model'
import { ValidDate } from './shared/ValidDate'
import { Utilisateur, UtilisateurUid, UtilisateurUidState } from './Utilisateur'
import { Result } from '@/shared/lang'

export class FeuilleDeRoute extends Entity<State> {
  override get state(): State {
    return {
      dateDeCreation: this.#dateDeCreation.toJSON(),
      dateDeModification: this.#dateDeModification.toJSON(),
      nom: this.#nom,
      noteDeContextualisation: this.#noteDeContextualisation,
      perimetreGeographique: this.#perimetreGeographique,
      uid: this.#uid.state,
      uidEditeur: this.#uidEditeur.state.value,
      uidGouvernance: this.#uidGouvernance.state.value,
      uidPorteur: this.#uidPorteur.state.value,
    }
  }

  readonly #dateDeCreation: ValidDate<FeuilleDeRouteFailure>
  #dateDeModification: ValidDate<FeuilleDeRouteFailure>
  readonly #nom: string
  #noteDeContextualisation?: string
  readonly #perimetreGeographique: PerimetreGeographiqueTypes
  readonly #uid: FeuilleDeRouteUid
  #uidEditeur: UtilisateurUid
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
    noteDeContextualisation?: string
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
    noteDeContextualisation?: string
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
      return new FeuilleDeRoute(
        new FeuilleDeRouteUid(uid.value),
        nom,
        perimetreGeographique,
        new MembreUid(uidPorteur),
        new UtilisateurUid(uidEditeur),
        new GouvernanceUid(uidGouvernance.value),
        dateDeCreationValidee,
        dateDeModificationValidee,
        noteDeContextualisation
      )
    }
    catch (error: unknown) {
      return (error as Exception<FeuilleDeRouteFailure>).message as FeuilleDeRouteFailure
    }
  }

  ajouterUneNoteDeContextualisation(
    noteDeContextualisation: string,
    date: Date,
    editeur: UtilisateurUid
  ): Result<FeuilleDeRouteFailure> {
    if (this.#noteDeContextualisation !== undefined) {
      return 'noteDeContextualisationDejaExistante'
    }
    this.#noteDeContextualisation = noteDeContextualisation
    this.#dateDeModification = new ValidDate(date, 'dateDeModificationInvalide')
    this.#uidEditeur = editeur
    return 'OK'
  }

  modifierUneNoteDeContextualisation(noteDeContextualisation: string, date: Date,editeur: UtilisateurUid): Result<FeuilleDeRouteFailure> {
    if (this.#noteDeContextualisation !== undefined) {
      this.#noteDeContextualisation = noteDeContextualisation
      this.#dateDeModification = new ValidDate(date, 'dateDeModificationInvalide')
      this.#uidEditeur = editeur
      return 'OK'
    }

    return 'noteDeContextualisationInexistante'
  }

  peutEtreGereePar(utilisateur: Utilisateur): boolean {
    return utilisateur.isAdmin
      || this.#uidGouvernance.state.value === utilisateur.state.departement?.code
      || this.#uidGouvernance.state.value === utilisateur.state.region?.code
  }

  supprimerNoteDeContextextualisation(): void {
    this.#noteDeContextualisation = undefined
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

type UidState = Readonly<{ value: string }>

type State = Readonly<{
  dateDeCreation: string
  dateDeModification: string
  nom: string
  noteDeContextualisation?: string
  perimetreGeographique: string
  uid: UidState
  uidEditeur: string
  uidGouvernance: string
  uidPorteur: string
}>
