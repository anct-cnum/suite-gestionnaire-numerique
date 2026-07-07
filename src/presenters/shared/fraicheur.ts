export type CouleurFraicheur = 'blue' | 'orange' | 'red' | 'yellow'

export const libellesFraicheur: Readonly<Record<CouleurFraicheur, string>> = {
  blue: 'À jour',
  orange: 'À vérifier',
  red: 'À actualiser',
  yellow: 'À surveiller',
}

const millisecondesParMois = 1000 * 60 * 60 * 24 * 30.44

export function couleurFraicheur(updatedAt: Date, now: Date): CouleurFraicheur {
  const diffMois = (now.getTime() - updatedAt.getTime()) / millisecondesParMois

  if (diffMois < 6) {
    return 'blue'
  }

  if (diffMois < 12) {
    return 'yellow'
  }

  if (diffMois < 18) {
    return 'orange'
  }

  return 'red'
}
