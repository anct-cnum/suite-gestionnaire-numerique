export function formaterEnNombreFrancais(number: number): string {
  return number.toLocaleString('fr-FR')
}

export function formatMontant(montant: number): string {
  return `${formaterEnNombreFrancais(montant)} €`
}

export function formatMontantEnMillions(montant: number): string {
  const millions = montant / 1_000_000
  return `${millions.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M€`
}
