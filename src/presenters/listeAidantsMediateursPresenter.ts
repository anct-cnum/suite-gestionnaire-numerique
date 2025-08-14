import { ListeAidantsMediateursReadModel } from '@/use-cases/queries/RecupererListeAidantsMediateurs'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export type ListeAidantsMediateursViewModel = Readonly<{
  aidants: Array<{
    dateModification: string
    email: string
    formation: Array<string>
    id: string
    labelisation: string
    nbAccompagnements: number
    nom: string
    nomComplet: string
    prenom: string
    role: Array<string>
    statut: string
    structureLocalisation: string
    structureNom: string
    telephone: string
    typeAidantLibelle: string
  }>
  page: number
  limite: number
  total: number
  totalPages: number
  displayPagination: boolean
  totalAccompagnements: number
  totalAidantsConnect: number
  totalBeneficiaires: number
  totalConseillers: number
  totalMediateurs: number
}>

export function listeAidantsMediateursPresenter(
  listeAidantsMediateursReadModel: ErrorReadModel | ListeAidantsMediateursReadModel,
): ErrorReadModel | ListeAidantsMediateursViewModel {
  if ('type' in listeAidantsMediateursReadModel) {
    return listeAidantsMediateursReadModel
  }

  return {
    aidants: listeAidantsMediateursReadModel.aidants,
    page: listeAidantsMediateursReadModel.page,
    limite: listeAidantsMediateursReadModel.limite,
    total: listeAidantsMediateursReadModel.total,
    totalPages: listeAidantsMediateursReadModel.totalPages,
    displayPagination: listeAidantsMediateursReadModel.displayPagination,
    totalAccompagnements: listeAidantsMediateursReadModel.totalAccompagnements,
    totalAidantsConnect: listeAidantsMediateursReadModel.totalAidantsConnect,
    totalBeneficiaires: listeAidantsMediateursReadModel.totalBeneficiaires,
    totalConseillers: listeAidantsMediateursReadModel.totalConseillers,
    totalMediateurs: listeAidantsMediateursReadModel.totalMediateurs,
  }
}