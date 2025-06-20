
// Échelle de couleurs pour l'indice de fragilité (1 à 10)
export const FRAGILITE_COLORS = {
  1: '#4A6BAE', // Très clair
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
    indice: commune.score ?? 0,
  }))
}

interface CommuneFragilite {
  codeInsee: string
  couleur: string
  indice: number
}

function getCouleurFragilite(indice: number): string {
  const numberOfColors = Object.keys(FRAGILITE_COLORS).length
  const maxIndice = 10

  // Gère les cas où l'indice est en dehors de la plage [0, 10]
  if (indice < 0 || indice > maxIndice) {
    return '#ffffff' // Retourne une couleur par défaut
  }

  // Calcule l'index de la couleur (de 1 à 7)
  const colorIndex = Math.max(1, Math.ceil(indice * numberOfColors / maxIndice))

  return FRAGILITE_COLORS[colorIndex as keyof typeof FRAGILITE_COLORS] || '#ffffff'
}

export type { CommuneFragilite }
