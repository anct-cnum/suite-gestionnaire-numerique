import { ListeAidantsMediateursReadModel } from '@/use-cases/queries/RecupererListeAidantsMediateurs'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export type ListeAidantsMediateursViewModel = Readonly<{
  aidants: Array<{
    formations: Array<string>
    id: string
    labelisations: Array<'aidants connect' | 'conseiller numérique'>
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
    totalConseillersNumerique: listeAidantsMediateursReadModel.totalConseillersNumerique,
    totalPages: listeAidantsMediateursReadModel.totalPages,
  }
}
