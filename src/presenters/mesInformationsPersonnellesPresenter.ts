import { MesInformationsPersonnelles } from '@/use-cases/queries/MesInformationsPersonnelles'

export function mesInformationsPersonnellesPresenter(
  mesInformationsPersonnelles: MesInformationsPersonnelles
): MesInformationsPersonnellesPresenterDTO {
  return {
    ...mesInformationsPersonnelles,
    isStructure: mesInformationsPersonnelles.role === 'Gestionnaire structure' || mesInformationsPersonnelles.role === 'Gestionnaire groupement',
  }
}

export type MesInformationsPersonnellesPresenterDTO = MesInformationsPersonnelles & {
  isStructure: boolean
}
