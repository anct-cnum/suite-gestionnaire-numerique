import { MesInformationsPersonnellesReadModel } from '@/use-cases/queries/MesInformationsPersonnellesQuery'

export function mesInformationsPersonnellesPresenter(
  mesInformationsPersonnellesReadModel: MesInformationsPersonnellesReadModel
): MesInformationsPersonnellesViewModel {
  return {
    ...mesInformationsPersonnellesReadModel,
    isStructure: mesInformationsPersonnellesReadModel.role === 'Gestionnaire structure' || mesInformationsPersonnellesReadModel.role === 'Gestionnaire groupement',
  }
}

export type MesInformationsPersonnellesViewModel = MesInformationsPersonnellesReadModel & {
  isStructure: boolean
}
