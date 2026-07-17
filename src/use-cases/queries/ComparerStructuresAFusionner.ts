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
  // true si la SA est déjà la survivante d'une fusion précédente (cf audit.structure_merge_log).
  dejaFusionnee: boolean
  deletedAt: Date | null
  denominationAntenne: null | string
  denominationSirene: null | string
  // true si la SA (via un de ses membres de gouvernance) bénéficie d'au moins une subvention.
  estBeneficiaire: boolean
  etatAdministratif: null | string
  id: number
  // Coordonnées (geom de l'adresse, SRID 4326). Permettent de calculer les distances entre
  // structures candidates : des antennes d'un même SIRET peuvent avoir des adresses distinctes.
  latitude: null | number
  longitude: null | number
  // Statut le plus engageant parmi les membres min.membre de la SA (confirme > candidat > supprimer),
  // null si la SA ne porte aucun membre.
  membreStatut: 'candidat' | 'confirme' | 'supprimer' | null
  // Nombre de mandats Aidants Connect (porté par la SA, indépendant des affectations).
  nbMandatsAc: null | number
  rattachements: RattachementsReadModel
  ridet: null | string
  rna: null | string
  siret: null | string
  // Source de la donnée (edited_by) : coop, carto, aidants-connect, idposte, MIN…
  source: null | string
  // Identifiants scalaires des sources agrégées portés inline par la SA. Une SA « porte » le
  // concept source dès que l'id est non-NULL, même sans aucune affectation (0 ligne + id ≠ NULL).
  structureAcId: null | string
  structureCoopId: null | string
  structureTpId: null | number
}>

// Ventilation des liens (FK) qui seront déplacés vers la survivante lors d'une
// fusion — alimente la « fenêtre d'avertissement » avant confirmation.
// `total` = somme des 7 FK directes (ce qui est réellement déplacé). Les compteurs
// gouvernance (gouvernances, feuillesDeRoute) sont des vues dérivées de la relation
// membre, fournies pour informer la décision sans gonfler `total`.
export type RattachementsReadModel = Readonly<{
  // Affectations emploi ventilées par source agrégée (sous-ensembles de affectationsEmploi).
  affectationsAc: number
  affectationsCoop: number
  // Total toutes sources (coop + idposte + aidants-connect + min) — conservé pour `total`.
  affectationsEmploi: number
  affectationsIdposte: number
  contacts: number
  contrats: number
  feuillesDeRoute: number
  gouvernances: number
  membresMin: number
  postes: number
  total: number
  utilisateursMin: number
}>

type Query = Readonly<{
  ids: ReadonlyArray<number>
}>
