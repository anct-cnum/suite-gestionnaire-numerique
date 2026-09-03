import departements from '../../ressources/departements.json'
import epci from '../../ressources/epci.json'
import regions from '../../ressources/regions.json'
import { TypologieRole } from '@/domain/Role'
import {
  FiltreGeographiqueStructures,
  FiltreLabellisationStructures,
  FiltresListeStructures,
} from '@/use-cases/queries/RecupererListeStructures'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

/**
 * Construit les filtres pour le loader à partir des paramètres d'URL et du scope utilisateur.
 * Le filtre géographique est disponible en scope national et pour les gestionnaires région (limité à leur région).
 */
export function buildFiltresListeStructures(
  params: FiltresListeStructuresURLParams,
  scopeFiltre: ScopeFiltre,
  utilisateurRole: TypologieRole,
  limite = 10
): FiltresListeStructures {
  const { codeDepartement, codeEpci, codeRegion, labellisation, page, recherche } = params

  let geographique: FiltreGeographiqueStructures | undefined
  if (scopeFiltre.type === 'national') {
    if (codeEpci !== undefined && codeEpci !== '') {
      geographique = { code: codeEpci, type: 'epci' }
    } else if (codeRegion !== undefined && codeRegion !== '') {
      geographique = { code: codeRegion, type: 'region' }
    } else if (codeDepartement !== undefined && codeDepartement !== '') {
      geographique = { code: codeDepartement, type: 'departement' }
    }
  } else if (utilisateurRole === 'Gestionnaire région' && scopeFiltre.type === 'departemental') {
    // Le département est validé contre le scope ; l'EPCI est intersecté avec le scope en SQL (décision PO #1279).
    if (codeEpci !== undefined && codeEpci !== '') {
      geographique = { code: codeEpci, type: 'epci' }
    } else if (codeDepartement !== undefined && codeDepartement !== '' && scopeFiltre.codes.includes(codeDepartement)) {
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
  scopeFiltre: ScopeFiltre,
  utilisateurRole: TypologieRole
): FiltresListeStructures {
  return {
    ...buildFiltresListeStructures(params, scopeFiltre, utilisateurRole),
    pagination: { limite: 999999, page: 1 },
  }
}

/**
 * Convertit les paramètres internes (depuis le filtre drawer) vers URLSearchParams.
 * Gère la conversion region/departement vers codeRegion/codeDepartement.
 */
export function buildURLSearchParamsFromStructuresFilters(params: URLSearchParams): URLSearchParams {
  const convertedParams = new URLSearchParams()

  const region = params.get('region') ?? params.get('codeRegion')
  const departement = params.get('departement') ?? params.get('codeDepartement')
  const codeEpci = params.get('codeEpci')
  const labellisation = parseLabellisation(params.get('labellisation') ?? undefined)

  if (region !== null && region !== '') {
    convertedParams.set('codeRegion', region)
  }
  if (departement !== null && departement !== '') {
    convertedParams.set('codeDepartement', departement)
  }
  if (codeEpci !== null && codeEpci !== '') {
    convertedParams.set('codeEpci', codeEpci)
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
  const codeEpci = params.get('codeEpci')
  const codeRegion = params.get('codeRegion')
  const labellisation = parseLabellisation(params.get('labellisation') ?? undefined)

  if (codeEpci !== null && codeEpci !== '') {
    const unEpci = epci.find((candidat) => candidat.code === codeEpci)
    filtres.push({
      label: unEpci?.nom ?? `EPCI ${codeEpci}`,
      paramKey: 'codeEpci',
      paramValue: codeEpci,
    })
  } else if (codeDepartement !== null && codeDepartement !== '') {
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
  if (paramKey === 'codeRegion' || paramKey === 'codeDepartement' || paramKey === 'codeEpci') {
    newParams.delete('codeRegion')
    newParams.delete('codeDepartement')
    newParams.delete('codeEpci')
  } else {
    newParams.delete(paramKey)
  }
  return newParams
}

// Types pour les paramètres d'URL de la liste des structures
export interface FiltresListeStructuresURLParams {
  codeDepartement?: string
  codeEpci?: string
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
