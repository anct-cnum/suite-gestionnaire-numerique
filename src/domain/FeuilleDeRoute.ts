import { GouvernanceUid, GouvernanceUidState } from './Gouvernance'
import { MembreUid } from './Membre'
import { Exception } from './shared/Exception'
import { Entity, Uid } from './shared/Model'
import { ValidDate } from './shared/ValidDate'
import { UtilisateurUid, UtilisateurUidState } from './Utilisateur'
import { Result } from '@/shared/lang'

export class FeuilleDeRoute extends Entity<State> {
  override get state(): State {
    return {
      dateDeCreation: this.#dateDeCreation.toJSON(),
      dateDeModification: this.#dateDeModification.toJSON(),
      nom: this.#nom,
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
    dateDeModification: Date
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
  }

  static create({
    dateDeCreation,
    dateDeModification,
    nom,
    perimetreGeographique,
    uid,
    uidEditeur,
    uidGouvernance,
    uidPorteur,
  }: {
    dateDeCreation: Date
    dateDeModification: Date
    nom: string
    perimetreGeographique: PerimetreGeographiqueTypes
    uid: UidState
    uidEditeur: UtilisateurUidState
    uidGouvernance: GouvernanceUidState
    uidPorteur: string
  }): Result<FeuilleDeRouteFailure, FeuilleDeRoute> {
    try{
      const dateDeModificationValidee = new ValidDate(dateDeModification,'dateDeModificationInvalide')
      const dateDeCreationValidee = new ValidDate(dateDeCreation,'dateDeCreationInvalide')
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
        dateDeModificationValidee
      )
    }
    catch (error: unknown) {
      return (error as Exception<FeuilleDeRouteFailure>).message as FeuilleDeRouteFailure
    }
  }
}

const Types = [
  'departemental',
  'groupementsDeCommunes',
  'regional',
]

export type PerimetreGeographiqueTypes = typeof Types[number]

export type FeuilleDeRouteFailure = 'dateDeCreationInvalide' | 'dateDeModificationInvalide' | 'perimetreGeographiqueInvalide'

type UidState = Readonly<{ value: string }>
class FeuilleDeRouteUid extends Uid<UidState> {
  constructor(value: string) {
    super({ value })
  }
}

type State = Readonly<{
  dateDeCreation: string
  dateDeModification: string
  nom: string
  perimetreGeographique: string
  uid: UidState
  uidEditeur: string
  uidGouvernance: string
  uidPorteur: string
}>
