import { QueryHandler } from '../QueryHandler'

// File de revue des appariements lieux mednum ↔ coop (#1845) : une « paire » =
// un record carto (carto_record_id) × un lieu coop, agrégeant tous ses segments
// d'id (plusieurs lignes main.lieu_appariement). Le loader ne renvoie que les
// paires dont le lieu existe encore (comme la vue dataviz.lieu_appariements_a_valider).
export class RechercherAppariementsLieux implements QueryHandler<Query, AppariementsLieuxReadModel> {
  readonly #loader: AppariementsLieuxLoader

  constructor(loader: AppariementsLieuxLoader) {
    this.#loader = loader
  }

  async handle(query: Query): Promise<AppariementsLieuxReadModel> {
    return this.#loader.rechercher(query)
  }
}

export interface AppariementsLieuxLoader {
  rechercher(query: Query): Promise<AppariementsLieuxReadModel>
}

// Statuts soumis à la revue humaine ; `auto` (preuve par segment) n'est jamais affiché.
export type StatutAppariement = 'a_valider' | 'rejete' | 'valide'

export const statutsAppariement: ReadonlyArray<StatutAppariement> = ['a_valider', 'valide', 'rejete']

export type AppariementsLieuxReadModel = Readonly<{
  appariements: ReadonlyArray<AppariementLieuReadModel>
  // Nombre de paires par statut, tous statuts de revue confondus (onglets).
  compteurs: Readonly<Record<StatutAppariement, number>>
  // Nombre total de paires du statut demandé (pagination).
  total: number
}>

export type AppariementLieuReadModel = Readonly<{
  carto: Readonly<{
    adresse: null | string
    commune: null | string
    nom: null | string
    recordId: string
    // Segments d'id mednum (un par source composant le record), ex. « France-Services_789 ».
    segments: ReadonlyArray<string>
    source: null | string
  }>
  decideLe: Date | null
  decidePar: null | string
  derniereDetection: Date
  distanceM: null | number
  lieu: Readonly<{
    codeInsee: null | string
    commune: null | string
    id: number
    nom: string
    nomVoie: null | string
    numeroVoie: null | number
    repetition: null | string
  }>
  scores: Readonly<{
    adresse: null | number
    distance: null | number
    global: null | number
    nom: null | number
  }>
  statut: StatutAppariement
}>

type Query = Readonly<{
  pagination: Readonly<{
    limite: number
    // Index de page, à partir de 0.
    page: number
  }>
  statut: StatutAppariement
}>
