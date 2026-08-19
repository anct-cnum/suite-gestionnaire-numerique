import { ScopeFiltre } from './ResoudreContexte'
import { ErrorReadModel } from './shared/ErrorReadModel'

export type FiltreGeographiqueStructures = Readonly<{
  code: string
  type: 'departement' | 'region'
}>

export type FiltreLabellisationStructures = 'aidants-connect' | 'conseiller-numerique'

export type FiltresListeStructures = Readonly<{
  geographique?: FiltreGeographiqueStructures
  labellisation?: FiltreLabellisationStructures
  pagination: Readonly<{
    limite: number
    page: number
  }>
  recherche?: string
  scopeFiltre: ScopeFiltre
}>

export interface ListeStructuresLoader {
  get(filtres: FiltresListeStructures): Promise<ErrorReadModel | ListeStructuresReadModel>
  getForExport(filtres: FiltresListeStructures): Promise<Array<StructureListeReadModel> | ErrorReadModel>
}

export type StructureListeReadModel = Readonly<{
  adresse: string
  codePostal: string
  commune: string
  derniereAttestationLabelConum: Date | null
  estHabiliteeAidantsConnect: boolean
  id: number
  nom: string
  possedePosteConumActif: boolean
  siret: string
  typologie: string
}>

export type ListeStructuresReadModel = Readonly<{
  displayPagination: boolean
  limite: number
  page: number
  structures: Array<StructureListeReadModel>
  total: number
  totalHabiliteesAidantsConnect: number
  totalLabelliseesConseillerNumerique: number
  totalPages: number
  totalStructures: number
}>
