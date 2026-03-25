import { ErrorReadModel } from './shared/ErrorReadModel'

export type FiltreGeographique = Readonly<{
  code: string
  type: 'departement' | 'region'
}>

export type FiltreRoles = ReadonlyArray<'Aidant' | 'Coordinateur' | 'Médiateur'>

export type FiltreHabilitations = ReadonlyArray<
  'Aidants Connect' | 'Conseiller numérique' | 'Sans habilitation/labellisation'
>

export type FiltreFormations = ReadonlyArray<'CCP1' | 'CCP2 & CCP3' | 'PIX' | 'REMN' | 'Sans formation'>

export type FiltresListeAidants = Readonly<{
  codesDepartementsScope?: ReadonlyArray<string>
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
  nom: string
  prenom: string
  role: Array<string>
}>

export type AidantMediateurAvecAccompagnementReadModel = AidantMediateurReadModel &
  Readonly<{
    adresseStructure: string
    nbAccompagnements: number
    nomStructure: string
    siretStructure: string
  }>

export type ListeAidantsMediateursReadModel = Readonly<{
  aidants: Array<AidantMediateurReadModel>
  displayPagination: boolean
  limite: number
  page: number
  total: number
  totalActeursNumerique: number
  totalConseillersNumerique: number
  totalPages: number
}>
