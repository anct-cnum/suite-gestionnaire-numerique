import { ActionUid } from './Action'
import { MembreUid } from './Membre'
import { Exception } from './shared/Exception'
import { Entity, Uid } from './shared/Model'
import { ValidDate } from './shared/ValidDate'
import { Result } from '@/shared/lang'
import { StatutSubvention } from '@/use-cases/queries/shared/ActionReadModel'

export class DemandeDeSubvention extends Entity<State> {
  override get state(): State {
    return {
      beneficiaires: this.#beneficiaires.map((beneficiaire) => beneficiaire.state.value),
      dateDeCreation: this.#dateDeCreation.toJSON(),
      derniereModification: this.#derniereModification.toJSON(),
      statut: this.#statut as StatutSubvention,
      subventionDemandee: this.#subventionDemandee,
      subventionEtp: this.#subventionEtp ?? undefined,
      subventionPrestation: this.#subventionPrestation ?? undefined,
      uid: this.#uid.state,
      uidAction: this.#uidAction.state.value,
      uidCreateur: this.#uidCreateur.state.value,
      uidEnveloppeFinancement: this.#uidEnveloppeFinancement.state.value,
    }
  }

  readonly #beneficiaires: Array<MembreUid>
  readonly #dateDeCreation: ValidDate<DemandeDeSubventionFailure>
  readonly #derniereModification: ValidDate<DemandeDeSubventionFailure>
  readonly #statut: string
  readonly #subventionDemandee: number
  readonly #subventionEtp: null | number
  readonly #subventionPrestation: null | number
  readonly #uid: DemandeDeSubventionUid
  readonly #uidAction: ActionUid
  readonly #uidCreateur: MembreUid
  readonly #uidEnveloppeFinancement: EnveloppeFinancementUid

  private constructor(
    uid: DemandeDeSubventionUid,
    beneficiaires: Array<MembreUid>,
    dateDeCreation: ValidDate<DemandeDeSubventionFailure>,
    derniereModification: ValidDate<DemandeDeSubventionFailure>,
    statut: StatutSubvention,
    subventionDemandee: number,
    subventionEtp: null | number,
    subventionPrestation: null | number,
    uidAction: ActionUid,
    uidEnveloppeFinancement: EnveloppeFinancementUid,
    uidCreateur: MembreUid
  ) {
    super(uid)
    this.#uid = uid
    this.#beneficiaires = beneficiaires
    this.#dateDeCreation = dateDeCreation
    this.#derniereModification = derniereModification
    this.#statut = statut
    this.#subventionDemandee = subventionDemandee
    this.#subventionEtp = subventionEtp
    this.#subventionPrestation = subventionPrestation
    this.#uidAction = uidAction
    this.#uidCreateur = uidCreateur
    this.#uidEnveloppeFinancement = uidEnveloppeFinancement
  }

  static create({
    beneficiaires,
    dateDeCreation,
    derniereModification,
    statut,
    subventionDemandee,
    subventionEtp,
    subventionPrestation,
    uid,
    uidAction,
    uidCreateur,
    uidEnveloppeFinancement,
  }: FactoryParams): Result<DemandeDeSubventionFailure, DemandeDeSubvention> {
    try {
      const dateDeCreationValidee = new ValidDate(dateDeCreation, 'dateDeCreationInvalide')
      const derniereModificationValidee = new ValidDate(derniereModification, 'derniereModificationInvalide')

      return new DemandeDeSubvention(
        new DemandeDeSubventionUid(uid.value),
        beneficiaires.map((beneficiaire) => new MembreUid(beneficiaire)),
        dateDeCreationValidee,
        derniereModificationValidee,
        statut,
        subventionDemandee,
        subventionEtp,
        subventionPrestation,
        new ActionUid(uidAction.value),
        new EnveloppeFinancementUid(uidEnveloppeFinancement.value),
        new MembreUid(uidCreateur)
      )
    }
    catch (error) {
      return (error as Exception<DemandeDeSubventionFailure>).message as DemandeDeSubventionFailure
    }
  }

  avecNouvelleUidAction(uidAction: string): DemandeDeSubvention {
    return DemandeDeSubvention.create({
      beneficiaires: this.#beneficiaires.map((beneficiaire) => beneficiaire.state.value),
      dateDeCreation: this.#dateDeCreation,
      derniereModification: this.#derniereModification,
      statut: this.#statut as StatutSubvention,
      subventionDemandee: this.#subventionDemandee,
      subventionEtp: this.#subventionEtp,
      subventionPrestation: this.#subventionPrestation,
      uid: this.#uid.state,
      uidAction: { value: uidAction },
      uidCreateur :this.#uidCreateur.state.value,
      uidEnveloppeFinancement: { value: this.#uidEnveloppeFinancement.state.value },
    }) as DemandeDeSubvention
  }
}

export type DemandeDeSubventionFailure = 'dateDeCreationInvalide' | 'derniereModificationInvalide'

export class DemandeDeSubventionUid extends Uid<UidState> {
  constructor(value: string) {
    super({ value })
  }
}

export class EnveloppeFinancementUid extends Uid<UidState> {
  constructor(value: string) {
    super({ value })
  }
}

type FactoryParams = Readonly<{
  beneficiaires: Array<string>
  dateDeCreation: Date
  derniereModification: Date
  statut: StatutSubvention
  subventionDemandee: number
  subventionEtp: null | number
  subventionPrestation: null | number
  uid: UidState
  uidAction: UidState
  uidCreateur: string
  uidEnveloppeFinancement: UidState
}>

type State = Readonly<{
  beneficiaires: Array<string>
  dateDeCreation: string
  derniereModification: string
  statut: StatutSubvention
  subventionDemandee: number
  subventionEtp?: number
  subventionPrestation?: number
  uid: UidState
  uidAction: string
  uidCreateur: string
  uidEnveloppeFinancement: string
}>

type UidState = Readonly<{ value: string }>
