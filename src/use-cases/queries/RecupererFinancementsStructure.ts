import { ErrorReadModel } from './shared/ErrorReadModel'

export interface FinancementsStructureLoader {
  get(structureId: number): Promise<ErrorReadModel | FinancementsStructureReadModel>
}

export type FinancementsStructureReadModel = Readonly<{
  conseillerNumerique: Readonly<{
    conventionne: string
    verse: string
  }>
  fneEngage: string
  nombreDeFinancementsEngagesParLEtat: number
  ventilationSubventionsParEnveloppe: ReadonlyArray<
    Readonly<{
      enveloppeTotale: string
      label: string
      total: string
    }>
  >
}>
