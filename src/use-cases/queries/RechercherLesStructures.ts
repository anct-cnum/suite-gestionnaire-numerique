export interface StructureLoader {
  findStructures(query: RechercherStruturesQuery): Promise<StructuresReadModel>
}

export type StructuresReadModel = ReadonlyArray<UneStructureReadModel>

export type RechercherStruturesQuery = Readonly<{
  match: string,
  zone?: ['departement' | 'region', string]
}>

type UneStructureReadModel = Readonly<{
  nom: string
  uid: string
}>
