import { MesInformationsPersonnellesReadModel } from '@/use-cases/queries/RecupererMesInformationsPersonnelles'

export function mesInformationsPersonnellesPresenter(
  mesInformationsPersonnellesReadModel: MesInformationsPersonnellesReadModel
): MesInformationsPersonnellesViewModel {
  const telephone = mesInformationsPersonnellesReadModel.informationsPersonnellesTelephone === '' ? 'Non renseigné' : mesInformationsPersonnellesReadModel.informationsPersonnellesTelephone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d)/g, '$1 $2 $3 $4 $5')

  return {
    ...mesInformationsPersonnellesReadModel,
    informationsPersonnellesTelephone: telephone,
    isStructure: mesInformationsPersonnellesReadModel.role === 'Gestionnaire structure' || mesInformationsPersonnellesReadModel.role === 'Gestionnaire groupement',
    telephoneBrut: mesInformationsPersonnellesReadModel.informationsPersonnellesTelephone,
  }
}

export type MesInformationsPersonnellesViewModel = MesInformationsPersonnellesReadModel & {
  isStructure: boolean
  telephoneBrut: string
}
