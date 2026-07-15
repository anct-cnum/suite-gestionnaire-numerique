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
  code_insee: string
  code_postal: string
  est_actif: boolean
  est_frr: boolean
  est_qpv: boolean
  id: string
  nb_accompagnements_ac: number
  nb_accompagnements_coop: number
  nom: string
  nom_commune: string
  nom_voie: null | string
  numero_voie: null | string
  structure_cartographie_nationale_id: null | string
  typologies: Array<string>
  updated_at: Date | null
  visible_pour_cartographie_nationale: boolean | null
}

export interface RecupererLieuxInclusionPort {
  getLieux(filtres: FiltresListeLieux): Promise<RecupererLieuxInclusionReadModel>
}
