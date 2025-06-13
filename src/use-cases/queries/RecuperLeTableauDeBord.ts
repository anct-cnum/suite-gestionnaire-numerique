export interface TableauDeBordLoader {
  get(codeDepartement: string): Promise<TableauDeBordLoaderFinancements>
}

export interface TableauDeBordLoaderFinancements {
  budget: Readonly<{
    feuillesDeRoute: number
    total: string
  }>
  credit: Readonly<{
    pourcentage: number
    total: string
  }>
  nombreDeFinancementsEngagesParLEtat: number
  ventilationSubventionsParEnveloppe: ReadonlyArray<{
    label: string
    total: string
  }>
}