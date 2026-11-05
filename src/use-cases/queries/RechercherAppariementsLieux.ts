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

// Présence sur la cartographie nationale. Valider une paire retire la fiche qui
// porte le record au profit du lieu retenu : si celui-ci n'est pas visible, le
// lieu disparaît de la carte (#2232).
export type VisibiliteSurLaCarte = 'masque' | 'supprime' | 'visible'

// Côté record : « absent » quand aucune fiche du registre ne porte le record.
export type VisibiliteDuRecord = 'absent' | VisibiliteSurLaCarte

export const visibilitesDuRecord: ReadonlyArray<VisibiliteDuRecord> = ['absent', 'masque', 'supprime', 'visible']

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
    // Fiche du registre qui porte le record : identifiant courant, sinon
    // mémoire des segments externes (fiche éteinte après un appariement).
    visibilite: VisibiliteDuRecord
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
    visibilite: VisibiliteSurLaCarte
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
