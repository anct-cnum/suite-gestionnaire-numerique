export const numberToString = (value: number): string => value.toLocaleString('fr-FR')

export const numberToPercentage = (value: number): string =>
  `${value.toLocaleString('fr-FR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })} %`

export const sPluriel = (count: number): string => (count === 1 ? '' : 's')

// MIN (#2357, RGAA 9.1) : niveaux de titre des sections, de leurs blocs et de leurs tableaux de données.
// L'application connectée (/statistiques) les place sous son h2 (h3 par défaut) ; la vitrine sous le h3
// « Données et statistiques » (h4).
export type NiveauTitreSection = 'h3' | 'h4'

export const niveauxDeTitre = (
  niveauTitre: NiveauTitreSection
): Readonly<{ bloc: 'h4' | 'h5'; section: NiveauTitreSection; tableau: 'h5' | 'h6' }> =>
  niveauTitre === 'h3' ? { bloc: 'h4', section: 'h3', tableau: 'h5' } : { bloc: 'h5', section: 'h4', tableau: 'h6' }
