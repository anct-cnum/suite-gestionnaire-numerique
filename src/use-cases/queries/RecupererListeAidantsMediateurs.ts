import { ErrorReadModel } from './shared/ErrorReadModel'

export type FiltreGeographique = Readonly<{
  code: string
  type: 'region' | 'departement'
}>

export type FiltresListeAidants = Readonly<{
  geographique?: FiltreGeographique
  pagination: Readonly<{
    limite: number
    page: number
  }>
  territoire: string
}>

export interface ListeAidantsMediateursLoader {
  get(filtres: FiltresListeAidants): Promise<ErrorReadModel | ListeAidantsMediateursReadModel>
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
