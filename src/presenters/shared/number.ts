export function formaterEnNombreFrancais(number: number): string {
  return number.toLocaleString('fr-FR')
}

export function formatMontant(montant: number): string {
  return `${formaterEnNombreFrancais(montant)} €`
}

export function formatMontantEnMillions(montant: number): string {
  if (montant >= 1_000_000) {
    return `${(montant / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} M€`
  }

  if (montant >= 10_000) {
    return `${(montant / 1_000).toLocaleString('fr-FR', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} K€`
  }

  return `${formaterEnNombreFrancais(montant)} €`
}
