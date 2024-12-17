export interface StructureLoader {
  findStructures(query: RechercherStruturesQuery): Promise<StructuresReadModel>
}

export type StructuresReadModel = ReadonlyArray<UneStructureReadModel>

export type RechercherStruturesQuery = Readonly<{
  match: string,
  zone?: ['departement' | 'region', string]
}>

export type UneStructureReadModel = Readonly<{
  nom: string
  commune: string
  uid: string
}>
