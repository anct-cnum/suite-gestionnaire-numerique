export type TerritoiresReadModel = Readonly<{
  departements: ReadonlyArray<DepartementAvecRegionReadModel>
  structureDepartements: ReadonlyMap<number, string>
}>

export interface TerritoireLoader {
  recupererTerritoires(structureIds: ReadonlyArray<number>): Promise<TerritoiresReadModel>
}

type DepartementAvecRegionReadModel = Readonly<{
  code: string
  nom: string
  regionCode: string
  regionNom: string
}>
