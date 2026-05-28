import type { ScopeFiltre } from './ResoudreContexte'

/**
 * Filtres exprimés en termes SGN — aucun identifiant Coop ici.
 */
export type StatistiquesPageFilters = Readonly<{
  au?: string // format YYYY-MM-DD
  communes?: ReadonlyArray<string> // codes INSEE (5 chiffres)
  departements?: ReadonlyArray<string> // codes département SGN ('75', '2A', '971')
  du?: string // format YYYY-MM-DD
  lieux?: ReadonlyArray<string> // IDs SGN main.lieu_inclusion (stringifiés depuis URL, post-refonte 2026)
  mediateurs?: ReadonlyArray<number> // IDs SGN main.personne (jamais des coop_id)
  scopeFiltre: ScopeFiltre // scope de l'utilisateur connecté
  structuresEmployeuses?: ReadonlyArray<string> // IDs SGN main.structure_administrative (stringifiés depuis URL, post-refonte 2026)
  thematiqueAdministratives?: ReadonlyArray<string> // clés PascalCase
  thematiqueNonAdministratives?: ReadonlyArray<string> // clés PascalCase
  types?: ReadonlyArray<'Collectif' | 'Demarche' | 'Individuel'>
}>
