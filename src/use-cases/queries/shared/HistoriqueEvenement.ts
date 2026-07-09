export type DetailEvenement = Readonly<{
  label: string
  statut: 'ajout' | 'contexte' | 'modification' | 'suppression'
  valeur: string
}>

export type EvenementHistorique = Readonly<{
  date: Date
  description: string
  details: ReadonlyArray<DetailEvenement>
  source: string
  type: string
}>

export type SourcePivot = Readonly<{
  pivot: null | string
  source: string
}>
