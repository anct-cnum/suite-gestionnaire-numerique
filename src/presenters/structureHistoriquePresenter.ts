import {
  EvenementViewModel,
  presenterEvenements,
  presenterSourcesPivots,
  SourcePivotViewModel,
} from './shared/historiqueEvenements'
import { StructureHistoriqueReadModel } from '@/use-cases/queries/RecupererStructureHistorique'

export function structureHistoriquePresenter(readModel: StructureHistoriqueReadModel): StructureHistoriqueViewModel {
  return {
    denomination: readModel.denomination,
    evenements: presenterEvenements(readModel.evenements),
    sourcesPivots: presenterSourcesPivots(readModel.sourcesPivots),
  }
}

export type StructureHistoriqueViewModel = Readonly<{
  denomination: string
  evenements: ReadonlyArray<EvenementViewModel>
  sourcesPivots: ReadonlyArray<SourcePivotViewModel>
}>
