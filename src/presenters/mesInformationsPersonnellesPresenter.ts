import { MesInformationsPersonnellesReadModel } from '@/use-cases/queries/RecupererMesInformationsPersonnelles'

export function mesInformationsPersonnellesPresenter(
  mesInformationsPersonnellesReadModel: MesInformationsPersonnellesReadModel
): MesInformationsPersonnellesViewModel {
  return {
    ...mesInformationsPersonnellesReadModel,
    informationsPersonnellesTelephone: mesInformationsPersonnellesReadModel.informationsPersonnellesTelephone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d)/g, '$1 $2 $3 $4 $5'),
    isStructure: mesInformationsPersonnellesReadModel.role === 'Gestionnaire structure' || mesInformationsPersonnellesReadModel.role === 'Gestionnaire groupement',
  }
}

export type MesInformationsPersonnellesViewModel = MesInformationsPersonnellesReadModel & {
  isStructure: boolean
}
