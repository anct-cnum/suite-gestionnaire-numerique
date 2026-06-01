import { QueryHandler } from '../QueryHandler'

export class ComparerStructuresAFusionner implements QueryHandler<Query, ComparaisonDoublonsReadModel> {
  readonly #loader: ComparaisonDoublonsLoader

  constructor(loader: ComparaisonDoublonsLoader) {
    this.#loader = loader
  }

  async handle(query: Query): Promise<ComparaisonDoublonsReadModel> {
    const structures = await this.#loader.comparer(query.ids)

    // Survivante suggérée = la plus rattachée (en tête de liste). À nombre de
    // rattachements égal, l'id le plus petit (souvent la plus ancienne) prime.
    return [...structures].sort(
      (gauche, droite) => droite.rattachements.total - gauche.rattachements.total || gauche.id - droite.id
    )
  }
}

export interface ComparaisonDoublonsLoader {
  comparer(ids: ReadonlyArray<number>): Promise<ComparaisonDoublonsReadModel>
}

export type ComparaisonDoublonsReadModel = ReadonlyArray<StructureDetailReadModel>

export type StructureDetailReadModel = Readonly<{
  adresse: null | string
  codeActivitePrincipale: null | string
  commune: null | string
  denominationAntenne: null | string
  denominationSirene: null | string
  etatAdministratif: null | string
  id: number
  rattachements: RattachementsReadModel
  ridet: null | string
  rna: null | string
  siret: null | string
}>

// Ventilation des liens (FK) qui seront déplacés vers la survivante lors d'une
// fusion — alimente la « fenêtre d'avertissement » avant confirmation.
export type RattachementsReadModel = Readonly<{
  affectationsEmploi: number
  associationsLieux: number
  contacts: number
  contrats: number
  membresMin: number
  postes: number
  total: number
  utilisateursMin: number
}>

type Query = Readonly<{
  ids: ReadonlyArray<number>
}>
