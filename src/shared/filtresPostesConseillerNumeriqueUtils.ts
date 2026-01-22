import departements from '../../ressources/departements.json'
import regions from '../../ressources/regions.json'
import { EtatPoste } from '@/use-cases/queries/RecupererLesPostesConseillerNumerique'

// Types pour les filtres internes utilisés dans les composants
export interface FiltresPostesConseillerNumeriqueInternes {
  bonification: boolean
  codeDepartement: null | string
  codeRegion: null | string
  conventions: Array<string>
  statut: string
  typesEmployeur: Array<string>
  typesPoste: Array<string>
}

/**
 * Parse les paramètres d'URL en filtres internes pour les composants
 */
export function parseURLParamsToFiltresPostesConseillerNumeriqueInternes(
  params: URLSearchParams
): FiltresPostesConseillerNumeriqueInternes {
  return {
    bonification: params.get('bonification') === 'true',
    codeDepartement: params.get('codeDepartement'),
    codeRegion: params.get('codeRegion'),
    conventions: params.get('conventions')?.split(',').filter(Boolean) ?? [],
    statut: params.get('statut') ?? '',
    typesEmployeur: params.get('typesEmployeur')?.split(',').filter(Boolean) ?? [],
    typesPoste: params.get('typesPoste')?.split(',').filter(Boolean) ?? [],
  }
}

/**
 * Construit les filtres pour le loader à partir des paramètres d'URL
 */
export function buildFiltresPostesConseillerNumerique(
  params: FiltresPostesConseillerNumeriqueURLParams,
  territoireDepartement?: string,
  limite = 10
): BuildFiltresResult {
  const { bonification, codeDepartement, codeRegion, conventions, page, statut, typesEmployeur, typesPoste } = params

  return {
    bonification: bonification === 'true' ? true : undefined,
    codeDepartement: codeDepartement ?? territoireDepartement,
    codeRegion,
    conventions: conventions !== undefined && conventions !== '' ? conventions.split(',') : undefined,
    limite,
    page: Number(page ?? '1'),
    statut: statut !== undefined && statut !== '' ? statut as EtatPoste : undefined,
    typesEmployeur: typesEmployeur !== undefined && typesEmployeur !== '' ? typesEmployeur.split(',') : undefined,
    typesPoste: typesPoste !== undefined && typesPoste !== '' ? typesPoste.split(',') : undefined,
  }
}

/**
 * Convertit les paramètres internes (depuis le filtre drawer) vers URLSearchParams
 */
export function buildURLSearchParamsFromPostesConseillerNumeriqueFilters(params: URLSearchParams): URLSearchParams {
  const convertedParams = new URLSearchParams()

  // Filtre géographique - les clés peuvent être soit 'region'/'departement' soit 'codeRegion'/'codeDepartement'
  const region = params.get('region') ?? params.get('codeRegion')
  const departement = params.get('departement') ?? params.get('codeDepartement')

  if (region !== null && region !== '') {
    convertedParams.set('codeRegion', region)
  }
  if (departement !== null && departement !== '') {
    convertedParams.set('codeDepartement', departement)
  }

  // Autres filtres - copie directe
  const paramsKeys = ['bonification', 'conventions', 'statut', 'typesEmployeur', 'typesPoste'] as const
  paramsKeys.forEach((key) => {
    const value = params.get(key)
    if (value !== null && value !== '') {
      convertedParams.set(key, value)
    }
  })

  return convertedParams
}

/**
 * Supprime un filtre spécifique des paramètres
 */
export function removePostesConseillerNumeriqueFilterFromParams(
  params: URLSearchParams,
  paramKey: string,
  paramValue: string
): URLSearchParams {
  const newParams = new URLSearchParams(params)

  if (paramKey === 'codeRegion' || paramKey === 'codeDepartement') {
    newParams.delete('codeRegion')
    newParams.delete('codeDepartement')
  } else if (['conventions', 'typesEmployeur', 'typesPoste'].includes(paramKey)) {
    const currentValue = newParams.get(paramKey)
    if (currentValue !== null && currentValue !== '') {
      const values = currentValue.split(',').filter((value) => value !== paramValue)
      if (values.length > 0) {
        newParams.set(paramKey, values.join(','))
      } else {
        newParams.delete(paramKey)
      }
    }
  } else {
    newParams.delete(paramKey)
  }

  return newParams
}

/**
 * Obtient la liste des filtres actifs pour l'affichage
 */
export function getActivePostesConseillerNumeriqueFilters(
  params: URLSearchParams
): Array<{ label: string; paramKey: string; paramValue: string }> {
  const filtres: Array<{ label: string; paramKey: string; paramValue: string }> = []

  const codeRegion = params.get('codeRegion')
  const codeDepartement = params.get('codeDepartement')
  const statut = params.get('statut')
  const bonification = params.get('bonification')
  const typesPoste = params.get('typesPoste')
  const conventions = params.get('conventions')
  const typesEmployeur = params.get('typesEmployeur')

  // Filtre géographique
  if (codeDepartement !== null && codeDepartement !== '') {
    const dept = (departements as ReadonlyArray<DepartementJson>).find((item) => item.code === codeDepartement)
    filtres.push({
      label: dept === undefined ? codeDepartement : `${dept.nom} (${dept.code})`,
      paramKey: 'codeDepartement',
      paramValue: codeDepartement,
    })
  } else if (codeRegion !== null && codeRegion !== '') {
    const reg = (regions as ReadonlyArray<RegionJson>).find((item) => item.code === codeRegion)
    filtres.push({
      label: reg?.nom ?? codeRegion,
      paramKey: 'codeRegion',
      paramValue: codeRegion,
    })
  }

  // Statut
  if (statut !== null && statut !== '') {
    const statutLabels: Record<string, string> = { occupe: 'Occupé', rendu: 'Rendu', vacant: 'Vacant' }
    filtres.push({ label: statutLabels[statut] ?? statut, paramKey: 'statut', paramValue: statut })
  }

  // Bonification
  if (bonification === 'true') {
    filtres.push({ label: 'Postes bonifiés', paramKey: 'bonification', paramValue: 'true' })
  }

  // Types de poste
  if (typesPoste !== null && typesPoste !== '') {
    const labels: Record<string, string> = { conseiller: 'Conseiller numérique', coordinateur: 'Coordinateur' }
    typesPoste.split(',').forEach((typePoste) => {
      filtres.push({ label: labels[typePoste] ?? typePoste, paramKey: 'typesPoste', paramValue: typePoste })
    })
  }

  // Conventions
  if (conventions !== null && conventions !== '') {
    const labels: Record<string, string> = { V1: 'Initiale (V1)', V2: 'Renouvellement (V2)' }
    conventions.split(',').forEach((convention) => {
      filtres.push({ label: labels[convention] ?? convention, paramKey: 'conventions', paramValue: convention })
    })
  }

  // Types d'employeur
  if (typesEmployeur !== null && typesEmployeur !== '') {
    const labels: Record<string, string> = { prive: 'Établissement privé', public: 'Établissement public' }
    typesEmployeur.split(',').forEach((typeEmployeur) => {
      filtres.push({ label: labels[typeEmployeur] ?? typeEmployeur, paramKey: 'typesEmployeur', paramValue: typeEmployeur })
    })
  }

  return filtres
}

// Types pour les paramètres d'URL des postes conseiller numérique
interface FiltresPostesConseillerNumeriqueURLParams {
  bonification?: string
  codeDepartement?: string
  codeRegion?: string
  conventions?: string
  page?: string
  statut?: string
  typesEmployeur?: string
  typesPoste?: string
}

interface BuildFiltresResult {
  bonification?: boolean
  codeDepartement?: string
  codeRegion?: string
  conventions?: Array<string>
  limite: number
  page: number
  statut?: EtatPoste
  typesEmployeur?: Array<string>
  typesPoste?: Array<string>
}

type DepartementJson = Readonly<{ code: string; nom: string; regionCode: string }>
type RegionJson = Readonly<{ code: string; nom: string }>
