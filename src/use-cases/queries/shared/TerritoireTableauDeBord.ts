import { FiltreTerritorial } from './FiltreTerritorial'
import { BoundingBoxReadModel } from '../RecupererScopeTerritorial'

// Maille de visualisation du tableau de bord : contrairement à Scope (qui encode les droits),
// ce type décrit le territoire affiché, sélectionnable via la recherche territoriale.
export type TerritoireTableauDeBord =
  | Readonly<{
      bbox: BoundingBoxReadModel
      code: string
      codesDepartement: ReadonlyArray<string>
      nom: string
      type: 'region'
    }>
  | Readonly<{
      bbox: BoundingBoxReadModel
      code: string
      codesInsee: ReadonlyArray<string>
      nom: string
      type: 'epci'
    }>
  | Readonly<{ code: string; type: 'departement' }>
  | Readonly<{ structureId: number; type: 'structure' }>
  | Readonly<{ type: 'france' }>

export type TerritoireGeographique = Exclude<
  TerritoireTableauDeBord,
  Readonly<{ structureId: number; type: 'structure' }>
>

export function filtreTerritorialDuTerritoire(territoire: TerritoireGeographique): FiltreTerritorial {
  switch (territoire.type) {
    case 'departement':
      return { code: territoire.code, type: 'departement' }
    case 'epci':
      return { codesInsee: territoire.codesInsee, type: 'communes' }
    case 'france':
      return { type: 'national' }
    case 'region':
      return { codes: territoire.codesDepartement, type: 'departements' }
  }
}
