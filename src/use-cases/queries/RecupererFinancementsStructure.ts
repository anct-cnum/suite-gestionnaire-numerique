import { ErrorReadModel } from './shared/ErrorReadModel'

export interface FinancementsStructureLoader {
  get(structureId: number): Promise<ErrorReadModel | FinancementsStructureReadModel>
}

export type FinancementsStructureReadModel = Readonly<{
  nombreDeFinancementsEngagesParLEtat: number
  totalFinancements: string
  ventilationSubventionsParEnveloppe: ReadonlyArray<
    Readonly<{
      enveloppeTotale: string
      label: string
      total: string
    }>
  >
}>
