
export const FRAGILITE_COLORS = {
  1: '#4A6BAE',
  2: '#5F8EC7',
  3: '#AAC4E6',
  4: '#E6DEEE',
  5: '#EBB5BD',
  6: '#DD7480',
  7: '#D95C5E',
}

export function indiceFragilitePresenter(ifnCommunes : ReadonlyArray<Readonly<{
  codeInsee: string
  score: null | number
}>>): Array<CommuneFragilite> {
  return ifnCommunes.map(commune => ({
    codeInsee: commune.codeInsee,
    couleur: getCouleurFragilite(commune.score ?? 0),
    indice: Number((commune.score ?? 0).toFixed(2)),
  }))
}

interface CommuneFragilite {
  codeInsee: string
  couleur: string
  indice: number
}

// il y a 7 couleurs pour un indice de 0 à 10
function getCouleurFragilite(indice: number): string {
  const nombreDeCouleurs = Object.keys(FRAGILITE_COLORS).length
  const nombreDIndice = 10

  const indiceDeCouleur = Math.max(1, Math.ceil(indice * nombreDeCouleurs / nombreDIndice))

  return FRAGILITE_COLORS[indiceDeCouleur as keyof typeof FRAGILITE_COLORS] || '#ffffff'
}

export type { CommuneFragilite }
