// Échelle de couleurs pour l'indice de fragilité (1 à 10)
const FRAGILITE_COLORS = {
  1: '#4A6BAE', // Très clair
  2: '#5F8EC7',
  3: '#AAC4E6',
  4: '#E6DEEE',
  5: '#EBB5BD',
  6: '#DD7480',
  7: '#D95C5E',
}  7: '',


export function indiceFragilitePresenter(departement: string): Array<CommuneFragilite> {
  return generateFakeCommunesFragilite(departement)
}

interface CommuneFragilite {
  codeInsee: string
  couleur: string
  indice: number
}

function getCouleurFragilite(indice: number): string {
  return FRAGILITE_COLORS[indice as keyof typeof FRAGILITE_COLORS] || '#ffffff'
}

function generateFakeCommunesFragilite(departement: string): Array<CommuneFragilite> {
  const communesFragilite: Array<CommuneFragilite> = []
  for (let index = 1; index <= 999; index += 1) {
    const indice = Math.floor(Math.random() * 7) + 1 // Valeur entre 1 et 7
    communesFragilite.push({
      codeInsee: departement + index.toString().padStart(3, '0'),
      couleur: getCouleurFragilite(indice),
      indice,
    })
  }
  return communesFragilite
}
export type { CommuneFragilite }
