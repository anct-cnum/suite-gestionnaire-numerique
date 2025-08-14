import { ErrorReadModel } from './shared/ErrorReadModel'

export interface ListeAidantsMediateursLoader {
  get(territoire: string, page: number, limite: number): Promise<ErrorReadModel | ListeAidantsMediateursReadModel>
}

export type AidantMediateurReadModel = Readonly<{
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

export type ListeAidantsMediateursReadModel = Readonly<{
  aidants: Array<AidantMediateurReadModel>
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