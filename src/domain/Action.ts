import { FeuilleDeRouteUid } from './FeuilleDeRoute'
import { MembreUid } from './Membre'
import { Exception } from './shared/Exception'
import { Entity, Uid } from './shared/Model'
import { ValidDate } from './shared/ValidDate'
import { Result } from '@/shared/lang'

export class Action extends Entity<State> {
  override get state(): State {
    return {
      beneficiaires: this.#beneficiaires.map((beneficiaire) => beneficiaire.state.value),
      besoins: this.#besoins,
      budgetGlobal: this.#budgetGlobal,
      contexte: this.#contexte,
      dateDeCreation: this.#dateDeCreation.toJSON(),
      dateDeDebut: this.#dateDeDebut.toJSON(),
      dateDeFin: this.#dateDeFin.toJSON(),
      description: this.#description,
      nom: this.#nom,
      uid: this.#uid.state,
      uidFeuilleDeRoute: this.#uidFeuilleDeRoute.state.value,
      uidPorteur: this.#uidPorteur.state.value,
    }
  }

  readonly #beneficiaires: Array<MembreUid>
  readonly #besoins: Array<string>
  readonly #budgetGlobal: number
  readonly #contexte: string
  readonly #dateDeCreation: ValidDate<ActionFailure>
  readonly #dateDeDebut: ValidDate<ActionFailure>
  readonly #dateDeFin: ValidDate<ActionFailure>
  readonly #description: string
  readonly #nom: string
  readonly #uid: ActionUid
  readonly #uidFeuilleDeRoute: FeuilleDeRouteUid
  readonly #uidPorteur: MembreUid

  private constructor(
    uid: ActionUid,
    besoins: Array<string>,
    beneficiaires: Array<MembreUid>,
    nom: string,
    contexte: string,
    description: string,
    budgetGlobal: number,
    uidFeuilleDeRoute: FeuilleDeRouteUid,
    uidPorteur: MembreUid,
    dateDeDebut: ValidDate<ActionFailure>,
    dateDeFin: ValidDate<ActionFailure>,
    dateDeCreation: ValidDate<ActionFailure>
  ) {
    super(uid)
    this.#uid = uid
    this.#besoins = besoins
    this.#beneficiaires = beneficiaires
    this.#nom = nom
    this.#contexte = contexte
    this.#description = description
    this.#budgetGlobal = budgetGlobal
    this.#uidFeuilleDeRoute = uidFeuilleDeRoute
    this.#uidPorteur = uidPorteur
    this.#dateDeDebut = dateDeDebut
    this.#dateDeFin = dateDeFin
    this.#dateDeCreation = dateDeCreation
  }

  static create({
    beneficiaires,
    besoins,
    budgetGlobal,
    contexte,
    dateDeCreation,
    dateDeDebut,
    dateDeFin,
    description,
    nom,
    uid,
    uidFeuilleDeRoute,
    uidPorteur,
  }: FactoryParams): Result<ActionFailure, Action> {
    try {
      const dateDeCreationValidee = new ValidDate(dateDeCreation, 'dateDeCreationInvalide')
      const dateDeDebutValidee = new ValidDate(dateDeDebut, 'dateDeDebutInvalide')
      const dateDeFinValidee = new ValidDate(dateDeFin, 'dateDeFinInvalide')
      return new Action(
        new ActionUid(uid.value),
        besoins,
        beneficiaires.map((beneficiaire) => new MembreUid(beneficiaire)),
        nom,
        contexte,
        description,
        budgetGlobal,
        new  FeuilleDeRouteUid(uidFeuilleDeRoute.value),
        new MembreUid(uidPorteur),
        dateDeDebutValidee,
        dateDeFinValidee,
        dateDeCreationValidee
      )
    }
    catch (error) {
      return (error as Exception<ActionFailure>).message as ActionFailure
    }
  }
}

export type ActionFailure = 'dateDeCreationInvalide' | 'dateDeDebutInvalide' | 'dateDeFinInvalide'

export class ActionUid extends Uid<UidState> {
  constructor(value: string) {
    super({ value })
  }
}

type FactoryParams = Readonly<{
  beneficiaires: Array<string>
  besoins: Array<string>
  budgetGlobal: number
  contexte: string
  dateDeCreation: Date
  dateDeDebut: Date
  dateDeFin: Date
  description: string
  nom: string
  uid: UidState
  uidFeuilleDeRoute: UidState
  uidPorteur: string
}>

type State = Readonly<{
  beneficiaires: Array<string>
  besoins: Array<string>
  budgetGlobal: number
  contexte: string
  dateDeCreation: string
  dateDeDebut: string
  dateDeFin: string
  description: string
  nom: string
  uid: UidState
  uidFeuilleDeRoute: string
  uidPorteur: string
}>

type UidState = Readonly<{ value: string }>
