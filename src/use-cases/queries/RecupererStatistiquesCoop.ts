export type StatistiquesFilters = Readonly<{
  du?: string // Date au format YYYY-MM-DD
  au?: string // Date au format YYYY-MM-DD
  types?: ReadonlyArray<'Individuel' | 'Demarche' | 'Collectif'>
  mediateurs?: ReadonlyArray<string> // UUIDs
  beneficiaires?: ReadonlyArray<string> // UUIDs
  communes?: ReadonlyArray<string> // Codes INSEE (5 caractères)
  departements?: ReadonlyArray<string> // Codes département (1-3 caractères)
  lieux?: ReadonlyArray<string> // UUIDs
  conseillerNumerique?: boolean // true = dans le dispositif, false = hors dispositif
}>

export type StatistiquesCoopReadModel = Readonly<{
  accompagnementsParJour: ReadonlyArray<Readonly<{
    label: string
    count: number
  }>>
  accompagnementsParMois: ReadonlyArray<Readonly<{
    label: string
    count: number
  }>>
  beneficiaires: Readonly<{
    total: number
    genres: ReadonlyArray<StatistiqueItem>
    trancheAges: ReadonlyArray<StatistiqueItem>
    statutsSocial: ReadonlyArray<StatistiqueItem>
  }>
  activites: Readonly<{
    total: number
    typeActivites: ReadonlyArray<StatistiqueItem>
    durees: ReadonlyArray<StatistiqueItem>
    typeLieu: ReadonlyArray<StatistiqueItem>
    thematiques: ReadonlyArray<StatistiqueItem>
    materiels: ReadonlyArray<StatistiqueItem>
  }>
  totaux: Readonly<{
    activites: Readonly<{
      total: number
      individuels: Readonly<{
        total: number
        proportion: number
      }>
      collectifs: Readonly<{
        total: number
        proportion: number
        participants: number
      }>
      demarches: Readonly<{
        total: number
        proportion: number
      }>
    }>
    accompagnements: Readonly<{
      total: number
      individuels: Readonly<{
        total: number
        proportion: number
      }>
      collectifs: Readonly<{
        total: number
        proportion: number
      }>
      demarches: Readonly<{
        total: number
        proportion: number
      }>
    }>
    beneficiaires: Readonly<{
      total: number
      nouveaux: number
      suivis: number
      anonymes: number
    }>
  }>
}>

type StatistiqueItem = Readonly<{
  value: string
  label: string
  count: number
  proportion: number
}>

export interface StatistiquesCoopLoader {
  recupererStatistiques(filtres?: StatistiquesFilters): Promise<StatistiquesCoopReadModel>
}