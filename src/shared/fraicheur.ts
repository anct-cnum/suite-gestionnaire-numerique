export type CouleurFraicheur = 'blue' | 'orange' | 'red' | 'yellow'

export const libellesFraicheur: Readonly<Record<CouleurFraicheur, string>> = {
  blue: 'À jour',
  orange: 'À vérifier',
  red: 'À actualiser',
  yellow: 'À surveiller',
}

export const temporalitesFraicheur: Readonly<Record<CouleurFraicheur, string>> = {
  blue: '- de 6 mois',
  orange: '12 à 18 mois',
  red: '+ de 18 mois',
  yellow: '6 à 12 mois',
}

export type SlugFraicheur = 'a-actualiser' | 'a-jour' | 'a-surveiller' | 'a-verifier'

export const couleurParSlugFraicheur: Readonly<Record<SlugFraicheur, CouleurFraicheur>> = {
  'a-actualiser': 'red',
  'a-jour': 'blue',
  'a-surveiller': 'yellow',
  'a-verifier': 'orange',
}

export const slugParCouleurFraicheur: Readonly<Record<CouleurFraicheur, SlugFraicheur>> = {
  blue: 'a-jour',
  orange: 'a-verifier',
  red: 'a-actualiser',
  yellow: 'a-surveiller',
}

const millisecondesParMois = 1000 * 60 * 60 * 24 * 30.44

// Un lieu sans date de mise à jour est considéré comme « À actualiser » (#1488).
export function couleurFraicheur(updatedAt: Date | null, now: Date): CouleurFraicheur {
  if (updatedAt === null) {
    return 'red'
  }

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

// Bornes d'un statut de fraîcheur : updated_at ∈ ]apres, jusqua].
// Mêmes seuils que couleurFraicheur pour garantir la cohérence compteur / filtre / pastille.
// Sans borne « apres » (statut rouge), les lieux sans date de mise à jour sont inclus.
export function bornesFraicheur(couleur: CouleurFraicheur, now: Date): Readonly<{ apres?: Date; jusqua?: Date }> {
  switch (couleur) {
    case 'blue':
      return { apres: dateSeuil(now, 6) }
    case 'orange':
      return { apres: dateSeuil(now, 18), jusqua: dateSeuil(now, 12) }
    case 'red':
      return { jusqua: dateSeuil(now, 18) }
    case 'yellow':
      return { apres: dateSeuil(now, 12), jusqua: dateSeuil(now, 6) }
  }
}

function dateSeuil(now: Date, mois: number): Date {
  return new Date(now.getTime() - mois * millisecondesParMois)
}
