// Types pour les filtres internes utilisés dans les composants
export interface FiltresLieuxInclusionInternes {
  codeDepartement: null | string
  codeRegion: null | string
  frr: boolean
  horsZonePrioritaire: boolean
  qpv: boolean
  typeStructure: string
}

/**
 * Parse les paramètres d'URL en filtres internes pour les composants
 */
export function parseURLParamsToFiltresLieuxInclusionInternes(params: URLSearchParams): FiltresLieuxInclusionInternes {
  return {
    codeDepartement: params.get('codeDepartement'),
    codeRegion: params.get('codeRegion'),
    frr: params.get('frr') === 'true',
    horsZonePrioritaire: params.get('horsZonePrioritaire') === 'true',
    qpv: params.get('qpv') === 'true',
    typeStructure: params.get('typeStructure') ?? '',
  }
}

/**
 * Construit les filtres pour le loader à partir des paramètres d'URL
 */
export function buildFiltresLieuxInclusion(
  params: FiltresLieuxInclusionURLParams,
  territoireDepartement?: string,
  limite = 10
): {
    codeDepartement?: string
    codeRegion?: string
    frr?: boolean
    horsZonePrioritaire?: boolean
    limite: number
    page: number
    qpv?: boolean
    typeStructure?: string
  } {
  const { codeDepartement, codeRegion, frr, horsZonePrioritaire, page, qpv, typeStructure } = params

  return {
    codeDepartement: codeDepartement ?? territoireDepartement,
    codeRegion,
    frr: frr === 'true' ? true : undefined,
    horsZonePrioritaire: horsZonePrioritaire === 'true' ? true : undefined,
    limite,
    page: Number(page ?? '1') - 1, // Conversion en index 0-based
    qpv: qpv === 'true' ? true : undefined,
    typeStructure,
  }
}

/**
 * Convertit les paramètres internes (depuis le filtre drawer) vers URLSearchParams
 */
export function buildURLSearchParamsFromLieuxInclusionFilters(params: URLSearchParams): URLSearchParams {
  const convertedParams = new URLSearchParams()

  // Copie directe des paramètres
  const codeDepartement = params.get('codeDepartement')
  const codeRegion = params.get('codeRegion')
  const typeStructure = params.get('typeStructure')
  const qpv = params.get('qpv')
  const frr = params.get('frr')
  const horsZonePrioritaire = params.get('horsZonePrioritaire')

  if (codeDepartement !== null && codeDepartement !== '') {
    convertedParams.set('codeDepartement', codeDepartement)
  }
  if (codeRegion !== null && codeRegion !== '') {
    convertedParams.set('codeRegion', codeRegion)
  }
  if (typeStructure !== null && typeStructure !== '') {
    convertedParams.set('typeStructure', typeStructure)
  }
  if (qpv === 'true') {
    convertedParams.set('qpv', 'true')
  }
  if (frr === 'true') {
    convertedParams.set('frr', 'true')
  }
  if (horsZonePrioritaire === 'true') {
    convertedParams.set('horsZonePrioritaire', 'true')
  }

  return convertedParams
}

/**
 * Supprime un filtre spécifique des paramètres
 */
export function removeLieuxInclusionFilterFromParams(
  params: URLSearchParams,
  paramKey: string
): URLSearchParams {
  const newParams = new URLSearchParams(params)
  newParams.delete(paramKey)
  return newParams
}

/**
 * Obtient la liste des filtres actifs pour l'affichage
 */
export function getActiveLieuxInclusionFilters(
  params: URLSearchParams,
  typesStructure?: Array<{ code: string; nom: string }>
): Array<{
    label: string
    paramKey: string
    paramValue: string
  }> {
  const filtres: Array<{ label: string; paramKey: string; paramValue: string }> = []

  const codeDepartement = params.get('codeDepartement')
  const codeRegion = params.get('codeRegion')
  const typeStructure = params.get('typeStructure')
  const qpv = params.get('qpv')
  const frr = params.get('frr')
  const horsZonePrioritaire = params.get('horsZonePrioritaire')

  if (codeDepartement !== null && codeDepartement !== '') {
    // Chercher le nom du département
    const departementName = getDepartementName(codeDepartement)
    filtres.push({
      label: departementName,
      paramKey: 'codeDepartement',
      paramValue: codeDepartement,
    })
  }

  if (codeRegion !== null && codeRegion !== '') {
    // Chercher le nom de la région
    const regionName = getRegionName(codeRegion)
    filtres.push({
      label: regionName,
      paramKey: 'codeRegion',
      paramValue: codeRegion,
    })
  }

  if (typeStructure !== null && typeStructure !== '') {
    // Chercher le nom du type de structure correspondant au code
    const typeStructureName = getTypeStructureName(typeStructure, typesStructure)
    filtres.push({
      label: typeStructureName,
      paramKey: 'typeStructure',
      paramValue: typeStructure,
    })
  }

  if (qpv === 'true') {
    filtres.push({
      label: 'QPV',
      paramKey: 'qpv',
      paramValue: 'true',
    })
  }

  if (frr === 'true') {
    filtres.push({
      label: 'FRR',
      paramKey: 'frr',
      paramValue: 'true',
    })
  }

  if (horsZonePrioritaire === 'true') {
    filtres.push({
      label: 'Hors zone prioritaire',
      paramKey: 'horsZonePrioritaire',
      paramValue: 'true',
    })
  }

  return filtres
}

// Types pour les paramètres d'URL des lieux d'inclusion
interface FiltresLieuxInclusionURLParams {
  codeDepartement?: string
  codeRegion?: string
  frr?: string
  horsZonePrioritaire?: string
  page?: string
  qpv?: string
  typeStructure?: string
}

/**
 * Fonction utilitaire pour obtenir le nom d'un département par son code
 */
function getDepartementName(code: string): string {
  const departements: Record<string, string> = {
    '01': 'Ain (01)',
    '02': 'Aisne (02)',
    '03': 'Allier (03)',
    '04': 'Alpes-de-Haute-Provence (04)',
    '05': 'Hautes-Alpes (05)',
    '06': 'Alpes-Maritimes (06)',
    '07': 'Ardèche (07)',
    '08': 'Ardennes (08)',
    '09': 'Ariège (09)',
    10: 'Aube (10)',
    11: 'Aude (11)',
    12: 'Aveyron (12)',
    13: 'Bouches-du-Rhône (13)',
    14: 'Calvados (14)',
    15: 'Cantal (15)',
    16: 'Charente (16)',
    17: 'Charente-Maritime (17)',
    18: 'Cher (18)',
    19: 'Corrèze (19)',
    21: 'Côte-d\'Or (21)',
    22: 'Côtes-d\'Armor (22)',
    23: 'Creuse (23)',
    24: 'Dordogne (24)',
    25: 'Doubs (25)',
    26: 'Drôme (26)',
    27: 'Eure (27)',
    28: 'Eure-et-Loir (28)',
    29: 'Finistère (29)',
    '2A': 'Corse-du-Sud (2A)',
    '2B': 'Haute-Corse (2B)',
    30: 'Gard (30)',
    31: 'Haute-Garonne (31)',
    32: 'Gers (32)',
    33: 'Gironde (33)',
    34: 'Hérault (34)',
    35: 'Ille-et-Vilaine (35)',
    36: 'Indre (36)',
    37: 'Indre-et-Loire (37)',
    38: 'Isère (38)',
    39: 'Jura (39)',
    40: 'Landes (40)',
    41: 'Loir-et-Cher (41)',
    42: 'Loire (42)',
    43: 'Haute-Loire (43)',
    44: 'Loire-Atlantique (44)',
    45: 'Loiret (45)',
    46: 'Lot (46)',
    47: 'Lot-et-Garonne (47)',
    48: 'Lozère (48)',
    49: 'Maine-et-Loire (49)',
    50: 'Manche (50)',
    51: 'Marne (51)',
    52: 'Haute-Marne (52)',
    53: 'Mayenne (53)',
    54: 'Meurthe-et-Moselle (54)',
    55: 'Meuse (55)',
    56: 'Morbihan (56)',
    57: 'Moselle (57)',
    58: 'Nièvre (58)',
    59: 'Nord (59)',
    60: 'Oise (60)',
    61: 'Orne (61)',
    62: 'Pas-de-Calais (62)',
    63: 'Puy-de-Dôme (63)',
    64: 'Pyrénées-Atlantiques (64)',
    65: 'Hautes-Pyrénées (65)',
    66: 'Pyrénées-Orientales (66)',
    67: 'Bas-Rhin (67)',
    68: 'Haut-Rhin (68)',
    69: 'Rhône (69)',
    70: 'Haute-Saône (70)',
    71: 'Saône-et-Loire (71)',
    72: 'Sarthe (72)',
    73: 'Savoie (73)',
    74: 'Haute-Savoie (74)',
    75: 'Paris (75)',
    76: 'Seine-Maritime (76)',
    77: 'Seine-et-Marne (77)',
    78: 'Yvelines (78)',
    79: 'Deux-Sèvres (79)',
    80: 'Somme (80)',
    81: 'Tarn (81)',
    82: 'Tarn-et-Garonne (82)',
    83: 'Var (83)',
    84: 'Vaucluse (84)',
    85: 'Vendée (85)',
    86: 'Vienne (86)',
    87: 'Haute-Vienne (87)',
    88: 'Vosges (88)',
    89: 'Yonne (89)',
    90: 'Territoire de Belfort (90)',
    91: 'Essonne (91)',
    92: 'Hauts-de-Seine (92)',
    93: 'Seine-Saint-Denis (93)',
    94: 'Val-de-Marne (94)',
    95: 'Val-d\'Oise (95)',
    971: 'Guadeloupe (971)',
    972: 'Martinique (972)',
    973: 'Guyane (973)',
    974: 'La Réunion (974)',
    976: 'Mayotte (976)',
  }

  return departements[code] ?? `Département ${code}`
}

/**
 * Fonction utilitaire pour obtenir le nom d'une région par son code
 */
function getRegionName(code: string): string {
  const regions: Record<string, string> = {
    '01': 'Guadeloupe',
    '02': 'Martinique',
    '03': 'Guyane',
    '04': 'La Réunion',
    '06': 'Mayotte',
    11: 'Île-de-France',
    24: 'Centre-Val de Loire',
    27: 'Bourgogne-Franche-Comté',
    28: 'Normandie',
    32: 'Hauts-de-France',
    44: 'Grand Est',
    52: 'Pays de la Loire',
    53: 'Bretagne',
    75: 'Nouvelle-Aquitaine',
    76: 'Occitanie',
    84: 'Auvergne-Rhône-Alpes',
    93: 'Provence-Alpes-Côte d\'Azur',
    94: 'Corse',
  }

  return regions[code] ?? `Région ${code}`
}

/**
 * Fonction utilitaire pour obtenir le nom d'un type de structure par son code
 */
function getTypeStructureName(
  code: string,
  typesStructure?: Array<{ code: string; nom: string }>
): string {
  if (!typesStructure) {
    return code
  }

  const typeStructure = typesStructure.find(type => type.code === code)
  return typeStructure ? typeStructure.nom : code
}
