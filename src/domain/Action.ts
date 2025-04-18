import { FeuilleDeRouteUid } from './FeuilleDeRoute'
import { Entity, Uid } from './shared/Model'
import { Result } from '@/shared/lang'

export class Action extends Entity<State> {
  override get state(): State {
    return {
      besoins: this.#besoins,
      budgetGlobal: this.#budgetGlobal,
      contexte: this.#contexte,
      createurId: this.#createurId,
      creation: this.#creation,
      dateDeDebut: this.#dateDeDebut.toJSON(),
      dateDeFin: this.#dateDeFin.toJSON(),
      derniereModification: this.#derniereModification.toJSON(),
      description: this.#description,
      nom: this.#nom,
      uid: this.#uid.state,
      uidFeuilleDeRoute: this.#uidFeuilleDeRoute.state.value,
    }
  }

  readonly #besoins: string
  readonly #budgetGlobal: string
  readonly #contexte: string
  readonly #createurId: string
  readonly #creation: string
  readonly #dateDeDebut: Date
  readonly #dateDeFin: Date
  readonly #derniereModification: Date
  readonly #description: string
  readonly #nom: string
  readonly #uid: ActionUid
  readonly #uidFeuilleDeRoute: FeuilleDeRouteUid

  private constructor(
    uid: ActionUid,
    besoins: string,
    createurId: string,
    nom: string,
    contexte: string,
    description: string,
    budgetGlobal: string,
    uidFeuilleDeRoute: FeuilleDeRouteUid,
    dateDeDebut: Date,
    dateDeFin: Date,
    creation: string,
    derniereModification: Date
  ) {
    super(uid)
    this.#uid = uid
    this.#besoins = besoins
    this.#createurId = createurId
    this.#nom = nom
    this.#contexte = contexte
    this.#description = description
    this.#budgetGlobal = budgetGlobal
    this.#uidFeuilleDeRoute = uidFeuilleDeRoute
    this.#dateDeDebut = dateDeDebut
    this.#dateDeFin = dateDeFin
    this.#creation = creation
    this.#derniereModification = derniereModification
  }

  static create({
    besoins,
    budgetGlobal,
    contexte,
    createurId,
    creation,
    dateDeDebut,
    dateDeFin,
    derniereModification,
    description,
    nom,
    uid,
    uidFeuilleDeRoute,
  }: FactoryParams): Result<Action> {
    const action = new Action(
      new ActionUid(uid.value),
      besoins,
      createurId,
      nom,
      contexte,
      description,
      budgetGlobal,
      new FeuilleDeRouteUid(uidFeuilleDeRoute.state.value),
      dateDeDebut,
      dateDeFin,
      creation,
      derniereModification
    )
    return action
  }
}

class ActionUid extends Uid<UidState> {
  constructor(value: string) {
    super({ value })
  }
}

type FactoryParams = Readonly<{
  besoins: string
  budgetGlobal: string
  contexte: string
  createurId: string
  creation: string
  dateDeDebut: Date
  dateDeFin: Date
  derniereModification: Date
  description: string
  nom: string
  uid: UidState
  uidFeuilleDeRoute: FeuilleDeRouteUid
}>

type State = Readonly<{
  besoins: string
  budgetGlobal: string
  contexte: string
  createurId: string
  creation: string
  dateDeDebut: string
  dateDeFin: string
  derniereModification: string
  description: string
  nom: string
  uid: UidState
  uidFeuilleDeRoute: string
}>

// editeurId de la modification d'une action ??

type UidState = Readonly<{ value: string }>
