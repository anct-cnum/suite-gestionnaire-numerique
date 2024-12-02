export function formaterEnDateFrancaise(date: Date): string {
  return date.toLocaleDateString('fr-FR')
}

export function formatForInputDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}
