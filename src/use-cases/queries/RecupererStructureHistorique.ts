import { ErrorReadModel } from './shared/ErrorReadModel'
import { EvenementHistorique, SourcePivot } from './shared/HistoriqueEvenement'

export type StructureHistoriqueReadModel = Readonly<{
  denomination: string
  evenements: ReadonlyArray<EvenementHistorique>
  sourcesPivots: ReadonlyArray<SourcePivot>
}>

export interface RecupererStructureHistoriqueLoader {
  recuperer(id: string): Promise<ErrorReadModel | StructureHistoriqueReadModel>
}
