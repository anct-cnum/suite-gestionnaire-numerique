import { FeuilleDeRouteUid } from './FeuilleDeRoute'
import { MembreUid } from './Membre'
import { Exception } from './shared/Exception'
import { Entity, Uid } from './shared/Model'
import { ValidDate, ValidDateFromYearString } from './shared/ValidDate'
import { Result } from '@/shared/lang'

export class Action extends Entity<State> {
  override get state(): State {
    return {
      besoins: this.#besoins,
      budgetGlobal: this.#budgetGlobal,
      contexte: this.#contexte,
      dateDeCreation: this.#dateDeCreation.toJSON(),
      dateDeDebut: this.#dateDeDebut.getFullYear().toString(),
      dateDeFin: this.#dateDeFin.getFullYear().toString(),
      description: this.#description,
      destinataires: this.#destinataires.map((destinataire) => destinataire.state.value),
      nom: this.#nom,
      uid: this.#uid.state,
      uidCreateur: this.#uidCreateur.state.value,
      uidFeuilleDeRoute: this.#uidFeuilleDeRoute.state.value,
      uidPorteur: this.#uidPorteur.state.value,
    }
  }

  readonly #besoins: Array<string>
  readonly #budgetGlobal: number
  readonly #contexte: string
  readonly #dateDeCreation: ValidDate<ActionFailure>
  readonly #dateDeDebut: ValidDate<ActionFailure>
  readonly #dateDeFin: ValidDate<ActionFailure>
  readonly #description: string
  readonly #destinataires: Array<MembreUid>
  readonly #nom: string
  readonly #uid: ActionUid
  readonly #uidCreateur: MembreUid
  readonly #uidFeuilleDeRoute: FeuilleDeRouteUid
  readonly #uidPorteur: MembreUid

  private constructor(
    uid: ActionUid,
    besoins: Array<string>,
    destinataires: Array<MembreUid>,
    nom: string,
    contexte: string,
    description: string,
    budgetGlobal: number,
    uidFeuilleDeRoute: FeuilleDeRouteUid,
    uidPorteur: MembreUid,
    uidCreateur: MembreUid,
    dateDeDebut: ValidDateFromYearString<ActionFailure>,
    dateDeFin: null | ValidDateFromYearString<ActionFailure>,
    dateDeCreation: ValidDate<ActionFailure>
  ) {
    super(uid)
    this.#uid = uid
    this.#besoins = besoins
    this.#destinataires = destinataires
    this.#nom = nom
    this.#contexte = contexte
    this.#description = description
    this.#budgetGlobal = budgetGlobal
    this.#uidFeuilleDeRoute = uidFeuilleDeRoute
    this.#uidPorteur = uidPorteur
    this.#uidCreateur = uidCreateur
    this.#dateDeDebut = dateDeDebut
    this.#dateDeFin =  dateDeFin ?? dateDeDebut
    this.#dateDeCreation = dateDeCreation
  }

  static create({
    besoins,
    budgetGlobal,
    contexte,
    dateDeCreation,
    dateDeDebut,
    dateDeFin,
    description,
    destinataires,
    nom,
    uid,
    uidCreateur,
    uidFeuilleDeRoute,
    uidPorteur,
  }: FactoryParams): Result<ActionFailure, Action> {
    try {
      const dateDeCreationValidee = new ValidDate(dateDeCreation, 'dateDeCreationInvalide')
      const dateDeDebutValidee = new ValidDateFromYearString(dateDeDebut, 'dateDeDebutInvalide')

      const dateDeFinValidee = dateDeFin ? new ValidDateFromYearString(dateDeFin, 'dateDeFinInvalide') :
        new ValidDateFromYearString(dateDeDebut, 'dateDeFinInvalide')
      return new Action(
        new ActionUid(uid.value),
        besoins,
        destinataires.map((beneficiaire) => new MembreUid(beneficiaire)),
        nom,
        contexte,
        description,
        budgetGlobal,
        new  FeuilleDeRouteUid(uidFeuilleDeRoute.value),
        new MembreUid(uidPorteur),
        new MembreUid(uidCreateur),
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
  besoins: Array<string>
  budgetGlobal: number
  contexte: string
  dateDeCreation: Date
  dateDeDebut: string
  dateDeFin: string
  description: string
  destinataires: Array<string>
  nom: string
  uid: UidState
  uidCreateur: string
  uidFeuilleDeRoute: UidState
  uidPorteur: string
}>

type State = Readonly<{
  besoins: Array<string>
  budgetGlobal: number
  contexte: string
  dateDeCreation: string
  dateDeDebut: string
  dateDeFin: string
  description: string
  destinataires: Array<string>
  nom: string
  uid: UidState
  uidCreateur: string
  uidFeuilleDeRoute: string
  uidPorteur: string
}>

type UidState = Readonly<{ value: string }>
