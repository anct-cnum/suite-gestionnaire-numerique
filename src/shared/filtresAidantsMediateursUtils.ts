import { TypologieRole } from '@/domain/Role'
import { FiltreFormations, FiltreGeographique, FiltreHabilitations, FiltreRoles, FiltresListeAidants } from '@/use-cases/queries/RecupererListeAidantsMediateurs'

// Types pour les paramètres d'URL
export interface FiltresURLParams {
  codeDepartement?: string
  codeRegion?: string
  formations?: string
  habilitations?: string
  page?: string
  roles?: string
}

/**
 * Parse les paramètres d'URL en filtres internes pour les composants
 */
export function parseURLParamsToFiltresInternes(params: URLSearchParams): FiltresInternes {
  return {
    codeDepartement: params.get('codeDepartement'),
    codeRegion: params.get('codeRegion'),
    formations: params.get('formations')?.split(',').filter(Boolean) ?? [],
    habilitations: params.get('habilitations')?.split(',').filter(Boolean) ?? [],
    roles: params.get('roles')?.split(',').filter(Boolean) ?? [],
  }
}

/**
 * Construit les filtres pour le use case à partir des paramètres d'URL
 */
export function buildFiltresListeAidants(
  params: FiltresURLParams,
  territoire: string,
  utilisateurRole: TypologieRole,
  limite = 10
): FiltresListeAidants {
  const { codeDepartement, codeRegion, formations, habilitations, page, roles } = params

  // Construction du filtre géographique - seulement pour les administrateurs
  let filtreGeographique: FiltreGeographique | undefined

  if (utilisateurRole === 'Administrateur dispositif') {
    if (codeDepartement !== undefined && codeDepartement !== '') {
      filtreGeographique = {
        code: codeDepartement,
        type: 'departement',
      }
    } else if (codeRegion !== undefined && codeRegion !== '') {
      filtreGeographique = {
        code: codeRegion,
        type: 'region',
      }
    }
  }

  return {
    formations: formations !== undefined && formations.length > 0
      ? formations.split(',') as FiltreFormations
      : undefined,
    geographique: filtreGeographique,
    habilitations: habilitations !== undefined && habilitations.length > 0
      ? habilitations.split(',') as FiltreHabilitations
      : undefined,
    pagination: {
      limite,
      page: Number(page ?? '1'),
    },
    roles: roles !== undefined && roles.length > 0
      ? roles.split(',') as FiltreRoles
      : undefined,
    territoire,
  }
}

/**
 * Construit les filtres pour l'export CSV (sans pagination)
 */
export function buildFiltresForExport(
  params: FiltresURLParams,
  territoire: string,
  utilisateurRole: TypologieRole
): FiltresListeAidants {
  const filtres = buildFiltresListeAidants(params, territoire, utilisateurRole)
  return {
    ...filtres,
    pagination: {
      limite: 999999, // Limite très élevée pour récupérer tous les résultats
      page: 1,
    },
  }
}

/**
 * Convertit les paramètres internes (depuis le filtre drawer) vers URLSearchParams
 * Gère la conversion region/departement vers codeRegion/codeDepartement
 */
export function buildURLSearchParamsFromFilters(params: URLSearchParams): URLSearchParams {
  const convertedParams = new URLSearchParams()

  // Filtre géographique - conversion des noms
  const region = params.get('region')
  const departement = params.get('departement')

  if (region !== null && region !== '') {
    convertedParams.set('codeRegion', region)
  }
  if (departement !== null && departement !== '') {
    convertedParams.set('codeDepartement', departement)
  }

  // Autres filtres - copie directe
  const roles = params.get('roles')
  const habilitations = params.get('habilitations')
  const formations = params.get('formations')

  if (roles !== null && roles !== '') {
    convertedParams.set('roles', roles)
  }
  if (habilitations !== null && habilitations !== '') {
    convertedParams.set('habilitations', habilitations)
  }
  if (formations !== null && formations !== '') {
    convertedParams.set('formations', formations)
  }

  return convertedParams
}

/**
 * Supprime un filtre spécifique des paramètres
 */
export function removeFilterFromParams(
  params: URLSearchParams,
  paramKey: string,
  paramValue: string
): URLSearchParams {
  const newParams = new URLSearchParams(params)

  if (paramKey === 'codeRegion' || paramKey === 'codeDepartement') {
    // Pour les filtres géographiques, supprimer complètement les deux
    newParams.delete('codeRegion')
    newParams.delete('codeDepartement')
  } else {
    // Pour les autres filtres, retirer la valeur spécifique
    const currentValue = newParams.get(paramKey)
    if (currentValue !== null && currentValue !== '') {
      const values = currentValue.split(',').filter(value => value !== paramValue)
      if (values.length > 0) {
        newParams.set(paramKey, values.join(','))
      } else {
        newParams.delete(paramKey)
      }
    }
  }

  return newParams
}

/**
 * Obtient la liste des filtres actifs pour l'affichage
 */
export function getActiveFilters(params: URLSearchParams): Array<{
  label: string
  paramKey: string
  paramValue: string
}> {
  const filtres: Array<{ label: string; paramKey: string; paramValue: string }> = []

  const codeRegion = params.get('codeRegion')
  const codeDepartement = params.get('codeDepartement')
  const roles = params.get('roles')
  const habilitations = params.get('habilitations')
  const formations = params.get('formations')

  // Filtre géographique
  if (codeDepartement !== null && codeDepartement !== '') {
    filtres.push({
      label: `Dép: ${codeDepartement}`,
      paramKey: 'codeDepartement',
      paramValue: codeDepartement,
    })
  } else if (codeRegion !== null && codeRegion !== '') {
    filtres.push({
      label: `Rég: ${codeRegion}`,
      paramKey: 'codeRegion',
      paramValue: codeRegion,
    })
  }

  // Filtres multiples
  if (roles !== null && roles !== '') {
    roles.split(',').forEach(role => {
      filtres.push({ label: role, paramKey: 'roles', paramValue: role })
    })
  }

  if (habilitations !== null && habilitations !== '') {
    habilitations.split(',').forEach(habilitation => {
      filtres.push({ label: habilitation, paramKey: 'habilitations', paramValue: habilitation })
    })
  }

  if (formations !== null && formations !== '') {
    formations.split(',').forEach(formation => {
      filtres.push({ label: formation, paramKey: 'formations', paramValue: formation })
    })
  }

  return filtres
}

// Types pour les filtres internes utilisés dans les composants
interface FiltresInternes {
  codeDepartement: null | string
  codeRegion: null | string
  formations: Array<string>
  habilitations: Array<string>
  roles: Array<string>
}