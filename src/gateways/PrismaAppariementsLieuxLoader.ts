import prisma from '../../prisma/prismaClient'
import {
  AppariementLieuReadModel,
  AppariementsLieuxLoader,
  AppariementsLieuxReadModel,
  StatutAppariement,
  statutsAppariement,
} from '@/use-cases/queries/RechercherAppariementsLieux'

export class PrismaAppariementsLieuxLoader implements AppariementsLieuxLoader {
  async rechercher(query: Parameters<AppariementsLieuxLoader['rechercher']>[0]): Promise<AppariementsLieuxReadModel> {
    const [compteurs, lignes] = await Promise.all([this.#compter(), this.#lister(query)])

    return {
      appariements: lignes.map(versReadModel),
      compteurs,
      total: compteurs[query.statut],
    }
  }

  // Paires (record × lieu) par statut de revue. Même périmètre que la vue
  // dataviz.lieu_appariements_a_valider : une paire dont le lieu a disparu n'est
  // pas comptée (le DAG nettoie les orphelins).
  async #compter(): Promise<Record<StatutAppariement, number>> {
    const lignes = await prisma.$queryRaw<Array<{ nombre: number; statut: string }>>`
      SELECT la.statut, COUNT(DISTINCT (la.carto_record_id, la.lieu_id))::int AS nombre
      FROM main.lieu_appariement la
      JOIN main.lieu_inclusion l ON l.id = la.lieu_id
      WHERE la.statut IN ('a_valider', 'valide', 'rejete')
      GROUP BY la.statut
    `
    const compteurs: Record<StatutAppariement, number> = { a_valider: 0, rejete: 0, valide: 0 }
    for (const ligne of lignes) {
      const statut = statutsAppariement.find((candidat) => candidat === ligne.statut)
      if (statut !== undefined) {
        compteurs[statut] = ligne.nombre
      }
    }

    return compteurs
  }

  // Une ligne par paire record × lieu : les segments (lignes de la table) sont
  // agrégés, les scores/snapshots carto sont identiques d'un segment à l'autre
  // (calculés sur le record complet) — MAX/MIN ne servent qu'à les sortir du GROUP BY.
  // Tri : meilleur score d'abord (file de revue), puis décision la plus récente
  // (historique), puis record pour un ordre stable en pagination.
  async #lister(query: Parameters<AppariementsLieuxLoader['rechercher']>[0]): Promise<ReadonlyArray<Ligne>> {
    const { limite, page } = query.pagination

    return prisma.$queryRaw<Array<Ligne>>`
      SELECT la.carto_record_id,
             la.lieu_id,
             array_agg(la.carto_segment ORDER BY la.carto_segment) AS segments,
             MAX(la.source) AS source,
             MAX(la.carto_nom) AS carto_nom,
             MAX(la.carto_adresse) AS carto_adresse,
             MAX(la.carto_commune) AS carto_commune,
             MAX(la.score_nom)::int AS score_nom,
             MAX(la.score_adresse)::int AS score_adresse,
             MAX(la.score_distance)::int AS score_distance,
             MAX(la.score_global)::int AS score_global,
             MIN(la.distance_m) AS distance_m,
             MAX(la.derniere_detection) AS derniere_detection,
             MAX(la.decide_par) AS decide_par,
             MAX(la.decide_le) AS decide_le,
             l.nom AS lieu_nom,
             a.numero_voie AS lieu_numero_voie,
             a.repetition AS lieu_repetition,
             a.nom_voie AS lieu_nom_voie,
             a.nom_commune AS lieu_commune,
             a.code_insee AS lieu_code_insee
      FROM main.lieu_appariement la
      JOIN main.lieu_inclusion l ON l.id = la.lieu_id
      LEFT JOIN main.adresse a ON a.id = l.adresse_id
      WHERE la.statut = ${query.statut}
      GROUP BY la.carto_record_id, la.lieu_id, l.nom,
               a.numero_voie, a.repetition, a.nom_voie, a.nom_commune, a.code_insee
      ORDER BY MAX(la.score_global) DESC NULLS LAST, MAX(la.decide_le) DESC NULLS LAST, la.carto_record_id, la.lieu_id
      LIMIT ${limite} OFFSET ${page * limite}
    `.then((lignes) => lignes.map((ligne) => ({ ...ligne, statut: query.statut })))
  }
}

function versReadModel(ligne: Ligne): AppariementLieuReadModel {
  return {
    carto: {
      adresse: ligne.carto_adresse,
      commune: ligne.carto_commune,
      nom: ligne.carto_nom,
      recordId: ligne.carto_record_id,
      segments: ligne.segments,
      source: ligne.source,
    },
    decideLe: ligne.decide_le,
    decidePar: ligne.decide_par,
    derniereDetection: ligne.derniere_detection,
    distanceM: ligne.distance_m,
    lieu: {
      codeInsee: ligne.lieu_code_insee,
      commune: ligne.lieu_commune,
      id: ligne.lieu_id,
      nom: ligne.lieu_nom,
      nomVoie: ligne.lieu_nom_voie,
      numeroVoie: ligne.lieu_numero_voie,
      repetition: ligne.lieu_repetition,
    },
    scores: {
      adresse: ligne.score_adresse,
      distance: ligne.score_distance,
      global: ligne.score_global,
      nom: ligne.score_nom,
    },
    statut: ligne.statut,
  }
}

type Ligne = Readonly<{
  carto_adresse: null | string
  carto_commune: null | string
  carto_nom: null | string
  carto_record_id: string
  decide_le: Date | null
  decide_par: null | string
  derniere_detection: Date
  distance_m: null | number
  lieu_code_insee: null | string
  lieu_commune: null | string
  lieu_id: number
  lieu_nom: string
  lieu_nom_voie: null | string
  lieu_numero_voie: null | number
  lieu_repetition: null | string
  score_adresse: null | number
  score_distance: null | number
  score_global: null | number
  score_nom: null | number
  segments: ReadonlyArray<string>
  source: null | string
  statut: StatutAppariement
}>
