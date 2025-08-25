import { ListeAidantsMediateursReadModel } from '@/use-cases/queries/RecupererListeAidantsMediateurs'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export type ListeAidantsMediateursViewModel = Readonly<{
  aidants: Array<{
    formation: Array<string>
    id: string
    labelisation: string
    nbAccompagnements: number
    nom: string
    prenom: string
    role: Array<string>
  }>
  displayPagination: boolean
  limite: number
  page: number
  total: number
  totalAccompagnements: number
  totalActeursNumerique: number
  totalBeneficiaires: number
  totalConseillersNumerique: number
  totalPages: number
}>

export function listeAidantsMediateursPresenter(
  listeAidantsMediateursReadModel: ErrorReadModel | ListeAidantsMediateursReadModel
): ErrorReadModel | ListeAidantsMediateursViewModel {
  if ('type' in listeAidantsMediateursReadModel) {
    return listeAidantsMediateursReadModel
  }

  return {
    aidants: listeAidantsMediateursReadModel.aidants,
    displayPagination: listeAidantsMediateursReadModel.displayPagination,
    limite: listeAidantsMediateursReadModel.limite,
    page: listeAidantsMediateursReadModel.page,
    total: listeAidantsMediateursReadModel.total,
    totalAccompagnements: listeAidantsMediateursReadModel.totalAccompagnements,
    totalActeursNumerique: listeAidantsMediateursReadModel.totalActeursNumerique,
    totalBeneficiaires: 0,
    totalConseillersNumerique: listeAidantsMediateursReadModel.totalConseillersNumerique,
    totalPages: listeAidantsMediateursReadModel.totalPages,
  }
}
