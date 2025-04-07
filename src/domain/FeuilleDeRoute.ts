import { GouvernanceUid, GouvernanceUidState } from './Gouvernance'
import { Exception } from './shared/Exception'
import { Entity, Uid } from './shared/Model'
import { ValidDate } from './shared/ValidDate'
import { UtilisateurUid, UtilisateurUidState } from './Utilisateur'
import { Result } from '@/shared/lang'

export class FeuilleDeRoute extends Entity<State> {
  override get state(): State {
    return {
      dateDeModification: this.#dateDeModification.toJSON(),
      nom: this.#nom,
      perimetreGeographique: this.#perimetreGeographique,
      porteur: this.#porteur,
      uid: this.#uid.state,
      uidEditeur: this.#uidEditeur.state.value,
      uidGouvernance: this.#uidGouvernance.state.value,
    }
  }

  readonly #dateDeModification: Date
  readonly #nom: string
  readonly #perimetreGeographique: PerimetreGeographique
  readonly #porteur: string
  readonly #uid: FeuilleDeRouteUid
  readonly #uidEditeur: UtilisateurUid
  readonly #uidGouvernance: GouvernanceUid

  private constructor(
    uid: FeuilleDeRouteUid,
    nom: string,
    perimetreGeographique: PerimetreGeographique,
    porteur: string,
    uidEditeur: UtilisateurUid,
    uidGouvernance: GouvernanceUid,
    dateDeModification: Date
  ) {
    super(uid)
    this.#uid = uid
    this.#nom = nom
    this.#perimetreGeographique = perimetreGeographique
    this.#porteur = porteur
    this.#uidEditeur = uidEditeur
    this.#uidGouvernance = uidGouvernance
    this.#dateDeModification = dateDeModification
  }

  static create({
    dateDeModification,
    nom,
    perimetreGeographique,
    porteur,
    uid,
    uidEditeur,
    uidGouvernance,
  }: {
    dateDeModification: Date
    nom: string
    perimetreGeographique: PerimetreGeographique
    porteur: string
    uid: UidState
    uidEditeur: UtilisateurUidState
    uidGouvernance: GouvernanceUidState
  }): Result<FeuilleDeRouteFailure, FeuilleDeRoute> {
    try{
      const dateDeModificationValidee = new ValidDate(dateDeModification,'dateDeModificationInvalide')
      const validPerimetres: Array<PerimetreGeographique> = ['départemental', 'EPCI', 'groupements de communes', 'régional']
      if (!validPerimetres.includes(perimetreGeographique)) {
        return 'perimetreGeographiqueInvalide'
      }
      return new FeuilleDeRoute(
        new FeuilleDeRouteUid(uid.value),
        nom,
        perimetreGeographique,
        porteur,
        new UtilisateurUid(uidEditeur),
        new GouvernanceUid(uidGouvernance.value),
        dateDeModificationValidee
      )
    }
    catch (error: unknown) {
      return (error as Exception<FeuilleDeRouteFailure>).message as FeuilleDeRouteFailure
    }
  }
}

export type PerimetreGeographique = 'départemental' | 'EPCI' | 'groupements de communes' | 'régional'

export type FeuilleDeRouteFailure = 'dateDeModificationInvalide' | 'perimetreGeographiqueInvalide'

type UidState = Readonly<{ value: string }>
class FeuilleDeRouteUid extends Uid<UidState> {
  constructor(value: string) {
    super({ value })
  }
}

type State = Readonly<{
  dateDeModification: string
  nom: string
  perimetreGeographique: PerimetreGeographique
  porteur: string
  uid: UidState
  uidEditeur: string
  uidGouvernance: string
}>
