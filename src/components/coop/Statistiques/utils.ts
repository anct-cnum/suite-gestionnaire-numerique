export const numberToString = (value: number): string =>
  value.toLocaleString('fr-FR')

export const numberToPercentage = (value: number): string =>
  `${value.toLocaleString('fr-FR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })} %`

export const sPluriel = (count: number): string => count === 1 ? '' : 's'
