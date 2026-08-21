export interface ScopeTerritorialLoader {
  getEpci(code: string): Promise<null | ScopeEpciReadModel>
  getRegion(code: string): Promise<null | ScopeRegionReadModel>
}

export type BoundingBoxReadModel = Readonly<{
  latitudeMax: number
  latitudeMin: number
  longitudeMax: number
  longitudeMin: number
}>

export type ScopeEpciReadModel = Readonly<{
  bbox: BoundingBoxReadModel
  code: string
  codeDepartement: null | string
  codesInsee: ReadonlyArray<string>
  nom: string
}>

export type ScopeRegionReadModel = Readonly<{
  bbox: BoundingBoxReadModel
  code: string
  codesDepartement: ReadonlyArray<string>
  nom: string
}>
