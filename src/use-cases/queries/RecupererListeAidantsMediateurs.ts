import { ErrorReadModel } from './shared/ErrorReadModel'

export interface ListeAidantsMediateursLoader {
  get(territoire: string, page: number, limite: number): Promise<ErrorReadModel | ListeAidantsMediateursReadModel>
}

export type AidantMediateurReadModel = Readonly<{
  formations: Array<string>
  id: string
  labelisations: Array<'aidants connect' | 'conseiller numérique'>
  nbAccompagnements: number
  nom: string
  prenom: string
  role: Array<string>
}>

export type ListeAidantsMediateursReadModel = Readonly<{
  aidants: Array<AidantMediateurReadModel>
  displayPagination: boolean
  limite: number
  page: number
  total: number
  totalAccompagnements: number
  totalActeursNumerique: number
  totalConseillersNumerique: number
  totalPages: number
}>
