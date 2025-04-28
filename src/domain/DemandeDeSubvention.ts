import { ActionUid } from './Action'
import { MembreUid } from './Membre'
import { Exception } from './shared/Exception'
import { Entity, Uid } from './shared/Model'
import { ValidDate } from './shared/ValidDate'
import { Result } from '@/shared/lang'

export class DemandeDeSubvention extends Entity<State> {
  override get state(): State {
    return {
      beneficiaires: this.#beneficiaires.map((beneficiaire) => beneficiaire.state.value),
      dateDeCreation: this.#dateDeCreation.toJSON(),
      derniereModification: this.#derniereModification.toJSON(),
      statut: this.#statut,
      subventionDemandee: this.#subventionDemandee,
      subventionEtp: this.#subventionEtp,
      subventionPrestation: this.#subventionPrestation,
      uid: this.#uid.state,
      uidAction: this.#uidAction.state.value,
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
  readonly #uidEnveloppeFinancement: EnveloppeFinancementUid

  private constructor(
    uid: DemandeDeSubventionUid,
    beneficiaires: Array<MembreUid>,
    dateDeCreation: ValidDate<DemandeDeSubventionFailure>,
    derniereModification: ValidDate<DemandeDeSubventionFailure>,
    statut: string,
    subventionDemandee: number,
    subventionEtp: null | number,
    subventionPrestation: null | number,
    uidAction: ActionUid,
    uidEnveloppeFinancement: EnveloppeFinancementUid
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
        new EnveloppeFinancementUid(uidEnveloppeFinancement.value)
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
      statut: this.#statut,
      subventionDemandee: this.#subventionDemandee,
      subventionEtp: this.#subventionEtp,
      subventionPrestation: this.#subventionPrestation,
      uid: this.#uid.state,
      uidAction: { value: uidAction },
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
  statut: string
  subventionDemandee: number
  subventionEtp: null | number
  subventionPrestation: null | number
  uid: UidState
  uidAction: UidState
  uidEnveloppeFinancement: UidState
}>

type State = Readonly<{
  beneficiaires: Array<string>
  dateDeCreation: string
  derniereModification: string
  statut: string
  subventionDemandee: number
  subventionEtp: null | number
  subventionPrestation: null | number
  uid: UidState
  uidAction: string
  uidEnveloppeFinancement: string
}>

type UidState = Readonly<{ value: string }>
