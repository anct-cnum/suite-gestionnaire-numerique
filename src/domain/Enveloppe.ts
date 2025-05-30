import { Uid } from './shared/Model'

export type EnveloppeState = Readonly<{
  dateDeDebut: Date
  dateDeFin: Date
  libelle: string
  montant: number
  uid: Uid<EnveloppeUidState>
}>

export type EnveloppeUidState = Readonly<{ value: string }>

export class EnveloppeUid extends Uid<EnveloppeUidState> {
  constructor(value: string) {
    super({ value })
  }
}

export class Enveloppe {
  readonly state: EnveloppeState

  constructor(state: EnveloppeState) {
    this.state = state
  }

  static fromReadModel(readModel: {
    dateDeDebut: Date
    dateDeFin: Date
    id: number
    libelle: string
    montant: number
  }): Enveloppe {
    return new Enveloppe({
      dateDeDebut: readModel.dateDeDebut,
      dateDeFin: readModel.dateDeFin,
      libelle: readModel.libelle,
      montant: readModel.montant,
      uid: new EnveloppeUid(String(readModel.id)),
    })
  }
} 