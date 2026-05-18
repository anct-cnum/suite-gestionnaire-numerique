import { ErrorReadModel } from './shared/ErrorReadModel'

export interface FinancementLoader {
  get(territoire: string): Promise<ErrorReadModel | TableauDeBordLoaderFinancements>
}

export interface FinancementAdminLoader {
  get(): Promise<ErrorReadModel | TableauDeBordLoaderFinancementsAdmin>
}

export interface TableauDeBordLoaderFinancements {
  budgetGlobalRenseigne: string
  conseillerNumerique: ConseillerNumeriqueFinancement
  fneEngage: string
  nombreDeFinancementsEngagesParLEtat: number
  ventilationSubventionsParEnveloppe: ReadonlyArray<VentilationEnveloppe>
}

export interface TableauDeBordLoaderFinancementsAdmin {
  conseillerNumerique: ConseillerNumeriqueFinancement
  fneDisponible: string
  fneEngage: string
  nombreDeFinancementsEngagesParLEtat: number
  ventilationSubventionsParEnveloppe: ReadonlyArray<VentilationEnveloppe>
}

type ConseillerNumeriqueFinancement = Readonly<{
  conventionne: string
  verse: string
}>

type VentilationEnveloppe = Readonly<{
  enveloppeTotale: string
  label: string
  total: string
}>
