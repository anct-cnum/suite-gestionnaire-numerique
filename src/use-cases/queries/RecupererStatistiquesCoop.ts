export type StatistiquesFilters = Readonly<{
  au?: string // Date au format YYYY-MM-DD
  beneficiaires?: ReadonlyArray<string> // UUIDs
  communes?: ReadonlyArray<string> // Codes INSEE (5 caractères)
  conseillerNumerique?: boolean // true = dans le dispositif, false = hors dispositif
  departements?: ReadonlyArray<string> // Codes département (1-3 caractères)
  du?: string // Date au format YYYY-MM-DD
  lieux?: ReadonlyArray<string> // UUIDs
  mediateurs?: ReadonlyArray<string> // UUIDs
  types?: ReadonlyArray<'Collectif' | 'Demarche' | 'Individuel'>
}>

export type StatistiquesCoopReadModel = Readonly<{
  accompagnementsParJour: ReadonlyArray<Readonly<{
    count: number
    label: string
  }>>
  accompagnementsParMois: ReadonlyArray<Readonly<{
    count: number
    label: string
  }>>
  activites: Readonly<{
    durees: ReadonlyArray<StatistiqueItem>
    materiels: ReadonlyArray<StatistiqueItem>
    thematiques: ReadonlyArray<StatistiqueItem>
    total: number
    typeActivites: ReadonlyArray<StatistiqueItem>
    typeLieu: ReadonlyArray<StatistiqueItem>
  }>
  beneficiaires: Readonly<{
    genres: ReadonlyArray<StatistiqueItem>
    statutsSocial: ReadonlyArray<StatistiqueItem>
    total: number
    trancheAges: ReadonlyArray<StatistiqueItem>
  }>
  totaux: Readonly<{
    accompagnements: Readonly<{
      collectifs: Readonly<{
        proportion: number
        total: number
      }>
      demarches: Readonly<{
        proportion: number
        total: number
      }>
      individuels: Readonly<{
        proportion: number
        total: number
      }>
      total: number
    }>
    activites: Readonly<{
      collectifs: Readonly<{
        participants: number
        proportion: number
        total: number
      }>
      demarches: Readonly<{
        proportion: number
        total: number
      }>
      individuels: Readonly<{
        proportion: number
        total: number
      }>
      total: number
    }>
    beneficiaires: Readonly<{
      anonymes: number
      nouveaux: number
      suivis: number
      total: number
    }>
  }>
}>

export interface StatistiquesCoopLoader {
  recupererStatistiques(filtres?: StatistiquesFilters): Promise<StatistiquesCoopReadModel>
}

type StatistiqueItem = Readonly<{
  count: number
  label: string
  proportion: number
  value: string
}>