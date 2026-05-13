export type StatutContrat = 'enCours' | 'termine'

export function calculerStatutContrat(dateRupture: Date | null | undefined): StatutContrat {
  return dateRupture === null || dateRupture === undefined ? 'enCours' : 'termine'
}
