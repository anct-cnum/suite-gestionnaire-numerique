import { ErrorReadModel } from './shared/ErrorReadModel'

export type FiltreGeographique = Readonly<{
  code: string
  type: 'region' | 'departement'
}>

export type FiltreRoles = ReadonlyArray<'Aidant' | 'Coordinateur' | 'Médiateur'>

export type FiltreHabilitations = ReadonlyArray<'Aidants Connect' | 'Conseiller numérique'>

export type FiltreFormations = ReadonlyArray<'CCP1' | 'CCP2 et CCP3' | 'PIX' | 'REMN'>

export type FiltresListeAidants = Readonly<{
  formations?: FiltreFormations
  geographique?: FiltreGeographique
  habilitations?: FiltreHabilitations
  pagination: Readonly<{
    limite: number
    page: number
  }>
  roles?: FiltreRoles
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
