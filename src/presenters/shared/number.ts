export function formaterEnNombreFrancais(number: number): string {
  return number.toLocaleString('fr-FR')
}

export function formatMontant(montant: number): string {
  return `${formaterEnNombreFrancais(montant)} €`
}
