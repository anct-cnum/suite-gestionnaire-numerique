export type StructuresReadModel = ReadonlyArray<UneStructureReadModel>

export interface StructureLoader {
  findStructures: (search: string) => Promise<StructuresReadModel>
}
type UneStructureReadModel = Readonly<{
  nom: string
  uid: string
}>
