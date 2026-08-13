// Date de lancement du dispositif Conseiller numérique.
export const DATE_DEBUT_DISPOSITIF = '2020-11-17'

const FORMAT_DATE_ISO = /^\d{4}-\d{2}-\d{2}$/

export function clamperPeriode(
  du: string | undefined,
  au: string | undefined,
  aujourdhui: string
): Readonly<{ au: string; du: string }> {
  const duValide = valeurValide(du)
  const auValide = valeurValide(au)

  return {
    au: clamper(auValide ?? aujourdhui, DATE_DEBUT_DISPOSITIF, aujourdhui),
    du: clamper(duValide ?? DATE_DEBUT_DISPOSITIF, DATE_DEBUT_DISPOSITIF, aujourdhui),
  }
}

function valeurValide(valeur: string | undefined): string | undefined {
  return valeur !== undefined && FORMAT_DATE_ISO.test(valeur) ? valeur : undefined
}

function clamper(valeur: string, min: string, max: string): string {
  if (valeur < min) return min
  if (valeur > max) return max
  return valeur
}
