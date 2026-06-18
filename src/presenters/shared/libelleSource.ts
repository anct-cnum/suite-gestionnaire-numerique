const LIBELLE_SOURCE: Readonly<Record<string, string>> = {
  'aidants-connect': 'Aidants Connect',
  carto: 'Cartographie nationale',
  coop: 'Coop médiation numérique',
  'id-poste': 'id-poste (CoNum)',
  min_scalingo: 'MIN',
  sonum: 'MIN',
}

// Libellé lisible de la source (`edited_by`) d'une structure ; repli sur la
// valeur brute si la source n'est pas connue du mapping.
export function libelleSource(source: null | string): string {
  if (source === null || source === '') {
    return 'Source inconnue'
  }
  return LIBELLE_SOURCE[source] ?? source
}
