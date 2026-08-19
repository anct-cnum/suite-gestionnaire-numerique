import departements from '../../ressources/departements.json'
import regions from '../../ressources/regions.json'
import {
  FiltreGeographiqueStructures,
  FiltreLabellisationStructures,
  FiltresListeStructures,
} from '@/use-cases/queries/RecupererListeStructures'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

/**
 * Construit les filtres pour le loader à partir des paramètres d'URL et du scope utilisateur.
 * Le filtre géographique (département/région) n'est disponible qu'en scope national.
 */
export function buildFiltresListeStructures(
  params: FiltresListeStructuresURLParams,
  scopeFiltre: ScopeFiltre,
  limite = 10
): FiltresListeStructures {
  const { codeDepartement, codeRegion, labellisation, page, recherche } = params

  let geographique: FiltreGeographiqueStructures | undefined
  if (scopeFiltre.type === 'national') {
    if (codeRegion !== undefined && codeRegion !== '') {
      geographique = { code: codeRegion, type: 'region' }
    } else if (codeDepartement !== undefined && codeDepartement !== '') {
      geographique = { code: codeDepartement, type: 'departement' }
    }
  }

  return {
    geographique,
    labellisation: parseLabellisation(labellisation),
    pagination: { limite, page: Number(page ?? '1') },
    recherche: nettoyerRecherche(recherche),
    scopeFiltre,
  }
}

/**
 * Construit les filtres pour l'export CSV (sans pagination)
 */
export function buildFiltresListeStructuresForExport(
  params: FiltresListeStructuresURLParams,
  scopeFiltre: ScopeFiltre
): FiltresListeStructures {
  return {
    ...buildFiltresListeStructures(params, scopeFiltre),
    pagination: { limite: 999999, page: 1 },
  }
}

/**
 * Convertit les paramètres internes (depuis le filtre drawer) vers URLSearchParams.
 * Gère la conversion region/departement vers codeRegion/codeDepartement.
 */
export function buildURLSearchParamsFromStructuresFilters(params: URLSearchParams): URLSearchParams {
  const convertedParams = new URLSearchParams()

  const region = params.get('region')
  const departement = params.get('departement')
  const labellisation = parseLabellisation(params.get('labellisation') ?? undefined)

  if (region !== null && region !== '') {
    convertedParams.set('codeRegion', region)
  }
  if (departement !== null && departement !== '') {
    convertedParams.set('codeDepartement', departement)
  }
  if (labellisation !== undefined) {
    convertedParams.set('labellisation', labellisation)
  }

  return convertedParams
}

/**
 * Obtient la liste des filtres actifs pour l'affichage
 */
export function getActiveStructuresFilters(params: URLSearchParams): Array<{
  label: string
  paramKey: string
  paramValue: string
}> {
  const filtres: Array<{ label: string; paramKey: string; paramValue: string }> = []

  const codeDepartement = params.get('codeDepartement')
  const codeRegion = params.get('codeRegion')
  const labellisation = parseLabellisation(params.get('labellisation') ?? undefined)

  if (codeDepartement !== null && codeDepartement !== '') {
    const departement = departements.find((dept) => dept.code === codeDepartement)
    filtres.push({
      label: departement ? `${departement.nom} (${departement.code})` : `Département ${codeDepartement}`,
      paramKey: 'codeDepartement',
      paramValue: codeDepartement,
    })
  } else if (codeRegion !== null && codeRegion !== '') {
    const region = regions.find((reg) => reg.code === codeRegion)
    filtres.push({
      label: region?.nom ?? `Région ${codeRegion}`,
      paramKey: 'codeRegion',
      paramValue: codeRegion,
    })
  }

  if (labellisation !== undefined) {
    filtres.push({
      label: labellisation === 'conseiller-numerique' ? 'Conseiller Numérique' : 'Aidants Connect',
      paramKey: 'labellisation',
      paramValue: labellisation,
    })
  }

  return filtres
}

/**
 * Supprime un filtre spécifique des paramètres
 */
export function removeStructuresFilterFromParams(params: URLSearchParams, paramKey: string): URLSearchParams {
  const newParams = new URLSearchParams(params)
  if (paramKey === 'codeRegion' || paramKey === 'codeDepartement') {
    newParams.delete('codeRegion')
    newParams.delete('codeDepartement')
  } else {
    newParams.delete(paramKey)
  }
  return newParams
}

// Types pour les paramètres d'URL de la liste des structures
export interface FiltresListeStructuresURLParams {
  codeDepartement?: string
  codeRegion?: string
  labellisation?: string
  page?: string
  recherche?: string
}

function nettoyerRecherche(valeur?: string): string | undefined {
  const nettoye = valeur?.trim() ?? ''
  return nettoye === '' ? undefined : nettoye
}

function parseLabellisation(valeur?: string): FiltreLabellisationStructures | undefined {
  return valeur === 'aidants-connect' || valeur === 'conseiller-numerique' ? valeur : undefined
}
