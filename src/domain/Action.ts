import { FeuilleDeRouteUid } from './FeuilleDeRoute'
import { MembreUid } from './Membre'
import { Exception } from './shared/Exception'
import { Entity, Uid } from './shared/Model'
import { ValidDate } from './shared/ValidDate'
import { UtilisateurUid, UtilisateurUidState } from './Utilisateur'
import { Result } from '@/shared/lang'

export class Action extends Entity<State> {
  override get state(): State {
    return {
      besoins: this.#besoins,
      budgetGlobal: this.#budgetGlobal,
      contexte: this.#contexte,
      dateDeCreation: this.#dateDeCreation.toJSON(),
      dateDeDebut: this.#dateDeDebut.toJSON(),
      dateDeFin: this.#dateDeFin.toJSON(),
      dateDeModification: this.#dateDeModification.toJSON(),
      description: this.#description,
      nom: this.#nom,
      uid: this.#uid.state,
      uidEditeur: this.#uidEditeur,
      uidFeuilleDeRoute: this.#uidFeuilleDeRoute.state.value,
      uidPorteur: this.#uidPorteur.state.value,
    }
  }

  readonly #besoins: Array<string>
  readonly #budgetGlobal: string
  readonly #contexte: string
  readonly #dateDeCreation: Date
  readonly #dateDeDebut: Date
  readonly #dateDeFin: Date
  readonly #dateDeModification: Date
  readonly #description: string
  readonly #nom: string
  readonly #uid: ActionUid
  readonly #uidEditeur: string
  readonly #uidFeuilleDeRoute: FeuilleDeRouteUid
  readonly #uidPorteur: MembreUid

  private constructor(
    uid: ActionUid,
    besoins: Array<string>,
    uidEditeur: string,
    nom: string,
    contexte: string,
    description: string,
    budgetGlobal: string,
    uidFeuilleDeRoute: FeuilleDeRouteUid,
    uidPorteur: MembreUid,
    dateDeDebut: Date,
    dateDeFin: Date,
    dateDeCreation: Date,
    dateDeModification: Date
  ) {
    super(uid)
    this.#uid = uid
    this.#besoins = besoins
    this.#uidEditeur = uidEditeur
    this.#nom = nom
    this.#contexte = contexte
    this.#description = description
    this.#budgetGlobal = budgetGlobal
    this.#uidFeuilleDeRoute = uidFeuilleDeRoute
    this.#uidPorteur = uidPorteur
    this.#dateDeDebut = dateDeDebut
    this.#dateDeFin = dateDeFin
    this.#dateDeCreation = dateDeCreation
    this.#dateDeModification = dateDeModification
  }

  static create({
    besoins,
    budgetGlobal,
    contexte,
    dateDeCreation,
    dateDeDebut,
    dateDeFin,
    dateDeModification,
    description,
    nom,
    uid,
    uidEditeur,
    uidFeuilleDeRoute,
    uidPorteur,
  }: FactoryParams): Result<ActionFailure, Action> {
    try {
      const dateDeModificationValidee = new ValidDate(dateDeModification, 'dateDeModificationInvalide')
      const dateDeCreationValidee = new ValidDate(dateDeCreation, 'dateDeCreationInvalide')
      const dateDeDebutValidee = new ValidDate(dateDeDebut, 'dateDeDebutInvalide')
      const dateDeFinValidee = new ValidDate(dateDeFin, 'dateDeFinInvalide')
      return new Action(
        new ActionUid(uid.value),
        besoins,
        new UtilisateurUid(uidEditeur).state.value,
        nom,
        contexte,
        description,
        budgetGlobal,
        new FeuilleDeRouteUid(uidFeuilleDeRoute.value),
        new MembreUid(uidPorteur),
        dateDeDebutValidee,
        dateDeFinValidee,
        dateDeCreationValidee,
        dateDeModificationValidee
      )
    }
    catch (error) {
      return (error as Exception<ActionFailure>).message as ActionFailure
    }
  }
}

export type ActionFailure = 'dateDeModificationInvalide'

export class ActionUid extends Uid<UidState> {
  constructor(value: string) {
    super({ value })
  }
}

type FactoryParams = Readonly<{
  besoins: Array<string>
  budgetGlobal: string
  contexte: string
  dateDeCreation: Date
  dateDeDebut: Date
  dateDeFin: Date
  dateDeModification: Date
  description: string
  nom: string
  uid: UidState
  uidEditeur: UtilisateurUidState
  uidFeuilleDeRoute: UidState
  uidPorteur: string
}>

type State = Readonly<{
  besoins: Array<string>
  budgetGlobal: string
  contexte: string
  dateDeCreation: string
  dateDeDebut: string
  dateDeFin: string
  dateDeModification: string
  description: string
  nom: string
  uid: UidState
  uidEditeur: string
  uidFeuilleDeRoute: string
  uidPorteur: string
}>

type UidState = Readonly<{ value: string }>
