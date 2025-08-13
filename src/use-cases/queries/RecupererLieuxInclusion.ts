export interface RecupererLieuxInclusionQuery {
  limite: number
  page: number
}

export interface RecupererLieuxInclusionReadModel {
  lieux: Array<LieuInclusionNumeriqueItem>
  limite: number
  page: number
  total: number
  totalAidantNumerique: number
  totalConseillerNumerique: number
  totalLabellise: number
}

export interface LieuInclusionNumeriqueItem {
  categorie_juridique: null | string
  code_insee: string
  code_postal: string
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
  type_structure: null | string
}

export interface RecupererLieuxInclusionPort {
  getLieuxWithPagination(page: number, limite: number, codeDepartement?: string): Promise<RecupererLieuxInclusionReadModel>
}
