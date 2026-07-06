import { ScopeFiltre } from './ResoudreContexte'

export type FiltreGeographiqueLieux = Readonly<{
  code: string
  type: 'departement' | 'region'
}>

export type StatutLieux = 'actif' | 'archive'

export type FiltresListeLieux = Readonly<{
  frr?: boolean
  geographique?: FiltreGeographiqueLieux
  horsZonePrioritaire?: boolean
  pagination: Readonly<{ limite: number; page: number }>
  qpv?: boolean
  scopeFiltre: ScopeFiltre
  statut: StatutLieux
  typeStructure?: string
}>

export interface RecupererLieuxInclusionReadModel {
  lieux: Array<LieuInclusionNumeriqueItem>
  limite: number
  page: number
  total: number
  totalActifs: number
  totalArchives: number
  totalConseillerNumerique: number
  totalLabellise: number
}

export interface LieuInclusionNumeriqueItem {
  categorie_juridique: null | string
  code_insee: string
  code_postal: string
  est_actif: boolean
  est_frr: boolean
  est_qpv: boolean
  id: string
  nb_accompagnements_ac: number
  nb_accompagnements_coop: number
  nb_mandats_ac: number
  nom: string
  nom_commune: string
  nom_voie: null | string
  numero_voie: null | string
  siret: null | string
  structure_cartographie_nationale_id: null | string
  type_structure: null | string
  updated_at: Date | null
  visible_pour_cartographie_nationale: boolean | null
}

export interface RecupererLieuxInclusionPort {
  getLieux(filtres: FiltresListeLieux): Promise<RecupererLieuxInclusionReadModel>
  getTypesStructure(): Promise<Array<{ code: string; nom: string }>>
}
