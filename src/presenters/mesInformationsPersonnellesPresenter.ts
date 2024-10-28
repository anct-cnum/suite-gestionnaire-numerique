import { MesInformationsPersonnellesReadModel } from '@/use-cases/queries/RecupererMesInformationsPersonnelles'

export function mesInformationsPersonnellesPresenter(
  mesInformationsPersonnellesReadModel: MesInformationsPersonnellesReadModel
): MesInformationsPersonnellesViewModel {
  const telephone = mesInformationsPersonnellesReadModel.telephone === '' ?
    'Non renseigné' :
    // Stryker disable next-line Regex
    mesInformationsPersonnellesReadModel.telephone.replace(/(\d{2,3})(\d{2})(\d{2})(\d{2})(\d{2})?(\d{2})$/g, '$1 $2 $3 $4 $5 $6')

  return {
    ...mesInformationsPersonnellesReadModel,
    telephone,
    telephoneBrut: mesInformationsPersonnellesReadModel.telephone,
  }
}

export type MesInformationsPersonnellesViewModel = MesInformationsPersonnellesReadModel & {
  telephoneBrut: string
}
