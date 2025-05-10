export function indiceFragilitePresenter(departement: string): Array<CommuneFragilite> {
  return generateFakeCommunesFragilite(departement)
}

interface CommuneFragilite {
  code: string
  fragilite: number
}

function generateFakeCommunesFragilite(departement: string): Array<CommuneFragilite> {
  const communesFragilite: Array<CommuneFragilite> = []
  for (let index = 1; index <= 999; index += 1) {
    communesFragilite.push({
      code: departement + index.toString().padStart(3, '0'),
      fragilite: Math.floor(Math.random() * 10) + 1, // Valeur entre 1 et 10
    })
  }
  return communesFragilite
}
export type { CommuneFragilite }
