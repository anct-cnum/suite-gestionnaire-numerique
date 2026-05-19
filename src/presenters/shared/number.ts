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
    return `${enMilliers(montant, 2, 2)} K€`
  }

  return `${formaterEnNombreFrancais(montant)} €`
}

export function formaterEnNombreAvecK(nombre: number): string {
  if (nombre >= 100_000) {
    return `${enMilliers(nombre, 1)} K`
  }
  return formaterEnNombreFrancais(nombre)
}

function enMilliers(nombre: number, maximumDecimales: number, minimumDecimales = 0): string {
  return (nombre / 1_000).toLocaleString('fr-FR', {
    maximumFractionDigits: maximumDecimales,
    minimumFractionDigits: minimumDecimales,
  })
}
