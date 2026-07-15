export type ColonneTriable = 'commune' | 'nom' | 'personnesEmployees' | 'rattachements'

export type FiltresListeStructuresAdministratives = Readonly<{
  adresse?: 'avec' | 'sans'
  aidantsConnect?: string
  commune?: string
  coop?: string
  departement?: string
  gouvernance?: 'gouvernance' | 'horsGouvernance'
  idposte?: string
  nom?: string
  pagination: Readonly<{ limite: number; page: number }>
  ridet?: string
  rna?: string
  siret?: string
  tri?: Readonly<{ colonne: ColonneTriable; ordre: 'asc' | 'desc' }>
  type?: 'antenne' | 'canonique'
}>

export interface RecupererStructuresAdministrativesReadModel {
  limite: number
  page: number
  structures: Array<StructureAdministrativeItem>
  total: number
}

export interface StructureAdministrativeItem {
  categorie_juridique: null | string
  code_postal: null | string
  deja_fusionnee: boolean
  denomination_antenne: null | string
  denomination_sirene: null | string
  est_gouvernance: boolean
  id: number
  nb_affectations_emploi: number
  nb_contacts: number
  nb_contrats: number
  nb_membres_min: number
  nb_personnes_employees: number
  nb_postes: number
  nb_utilisateurs_min: number
  nom_commune: null | string
  nom_voie: null | string
  numero_voie: null | number
  ridet: null | string
  rna: null | string
  siret: null | string
  structure_ac_id: null | string
  structure_coop_id: null | string
  structure_tp_id: null | number
}

export interface RecupererStructuresAdministrativesPort {
  getStructures(filtres: FiltresListeStructuresAdministratives): Promise<RecupererStructuresAdministrativesReadModel>
}
