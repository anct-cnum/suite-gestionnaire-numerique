export type StructuresReadModel = ReadonlyArray<UneStructureReadModel>

export interface StructuresLoader {
  findStructures: (search: string) => Promise<StructuresReadModel>
}
type UneStructureReadModel = Readonly<{
  nom: string
  uid: string
}>
