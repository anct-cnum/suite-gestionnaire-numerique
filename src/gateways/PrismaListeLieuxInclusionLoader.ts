import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import departements from '../../ressources/departements.json'
import {
  FiltresListeLieux,
  LieuInclusionNumeriqueItem,
  RecupererLieuxInclusionPort,
  RecupererLieuxInclusionReadModel,
  StatutLieux,
} from '@/use-cases/queries/RecupererLieuxInclusion'

// Refonte 2026 : ce loader cible main.lieu_inclusion. Le lien lieu ↔ structure
// administrative (table d'asso) a ete supprime (#1711) : le loader n'expose plus
// d'attribut derive d'une SA (siret, categorie juridique, mandats AC). La colonne
// "type de structure" affichee est desormais la typologie native du lieu
// (main.lieu_inclusion.typologies), et le perimetre d'un gestionnaire de SA se
// calcule via les affectations des personnes (paf_lieu × paf_emploi).
export class PrismaListeLieuxInclusionLoader implements RecupererLieuxInclusionPort {
  async getLieux(filtres: FiltresListeLieux): Promise<RecupererLieuxInclusionReadModel> {
    const { pagination } = filtres
    const scopeCte = this.buildScopeCte(filtres)
    const scopeCteActifs = this.buildScopeCte({ ...filtres, statut: 'actif' })
    const scopeCteArchives = this.buildScopeCte({ ...filtres, statut: 'archive' })
    const whereConditions = this.buildWhereConditions(filtres)
    const limitOffset = Prisma.sql`OFFSET ${pagination.page * pagination.limite} FETCH NEXT ${pagination.limite} ROWS ONLY`

    const [totalActifs, totalArchives, lieux, stats] = await Promise.all([
      this.queryTotal(scopeCteActifs, whereConditions),
      this.queryTotal(scopeCteArchives, whereConditions),
      this.queryLieux(scopeCte, whereConditions, limitOffset),
      this.queryStats(scopeCte, whereConditions),
    ])

    return {
      lieux,
      limite: pagination.limite,
      page: pagination.page,
      total: filtres.statut === 'archive' ? totalArchives : totalActifs,
      totalActifs,
      totalArchives,
      totalConseillerNumerique: stats.totalConseillerNumerique,
      totalLabellise: stats.totalLabellise,
    }
  }

  // Actif = au moins une affectation active sur le lieu ; archivé = aucune.
  private buildFiltreStatut(statut: StatutLieux): Prisma.Sql {
    if (statut === 'archive') {
      return Prisma.sql`AND NOT EXISTS (
        SELECT 1 FROM main.personne_affectations_lieu pal
        WHERE pal.lieu_id = l.id AND pal.est_active = true
      )`
    }
    return Prisma.sql`AND EXISTS (
      SELECT 1 FROM main.personne_affectations_lieu pal
      WHERE pal.lieu_id = l.id AND pal.est_active = true
    )`
  }

  // Étape 1 — Périmètre d'accès : "quels lieux ai-je le droit de voir ?"
  // Le filtre géographique explicite (UI, admin seulement) prend le pas sur le scope departemental.
  private buildScopeCte(filtres: FiltresListeLieux): Prisma.Sql {
    const { geographique, scopeFiltre, statut } = filtres
    const filtreStatut = this.buildFiltreStatut(statut)

    if (geographique) {
      const codesDepartements =
        geographique.type === 'region'
          ? departements.filter((dept) => dept.regionCode === geographique.code).map((dept) => dept.code)
          : [geographique.code]
      return Prisma.sql`lieux_dans_scope AS (
        SELECT l.id
        FROM main.lieu_inclusion l
        LEFT JOIN main.adresse a ON a.id = l.adresse_id
        WHERE a.departement = ANY(${codesDepartements})
          ${filtreStatut}
      )`
    }

    if (scopeFiltre.type === 'departemental') {
      const codesDepartements = [...scopeFiltre.codes]
      return Prisma.sql`lieux_dans_scope AS (
        SELECT l.id
        FROM main.lieu_inclusion l
        LEFT JOIN main.adresse a ON a.id = l.adresse_id
        WHERE a.departement = ANY(${codesDepartements})
          ${filtreStatut}
      )`
    }

    if (scopeFiltre.type === 'structure') {
      // scopeFiltre.id refere a une structure_administrative.id. Depuis le
      // retrait de l'asso lieu ↔ SA (#1711), un gestionnaire de SA voit les
      // lieux ou travaillent des personnes employees par sa SA (paf_lieu ×
      // paf_emploi croises, plus min.personne_enrichie pour les mediateurs Coop
      // sans paf_emploi). Pour les lieux archivés, le périmètre est calculé sans
      // exiger d'affectations actives, puis le statut est appliqué.
      const filtreEmploiActif = statut === 'archive' ? Prisma.empty : Prisma.sql`AND pae.est_active = true`
      const filtreLieuActif = statut === 'archive' ? Prisma.empty : Prisma.sql`AND pal.est_active = true`
      return Prisma.sql`lieux_dans_scope AS (
        SELECT l.id
        FROM main.lieu_inclusion l
        WHERE EXISTS (
            SELECT 1 FROM main.personne_affectations_lieu pal
            WHERE pal.lieu_id = l.id ${filtreLieuActif}
              AND pal.personne_id IN (
                SELECT pae.personne_id FROM main.personne_affectations_emploi pae
                WHERE pae.structure_administrative_id = ${scopeFiltre.id} ${filtreEmploiActif}
                UNION
                SELECT pe.id FROM min.personne_enrichie pe
                WHERE pe.structure_employeuse_id = ${scopeFiltre.id}
              )
          )
          ${filtreStatut}
      )`
    }

    // Scope national : aucune restriction d'accès
    return Prisma.sql`lieux_dans_scope AS (
      SELECT l.id FROM main.lieu_inclusion l
      WHERE true
        ${filtreStatut}
    )`
  }

  // Étape 2 — Filtres UI : "parmi les lieux accessibles, lesquels correspondent à la recherche ?"
  private buildWhereConditions(filtres: FiltresListeLieux): Prisma.Sql {
    const conditions: Array<Prisma.Sql> = []

    if (filtres.qpv === true) {
      conditions.push(Prisma.sql`EXISTS (
        SELECT 1 FROM admin.zonage z
        WHERE z.type = 'QPV' AND public.st_contains(z.geom, a.geom)
      )`)
    }
    if (filtres.frr === true) {
      conditions.push(Prisma.sql`EXISTS (
        SELECT 1 FROM admin.zonage z
        WHERE z.type = 'FRR' AND z.code_insee = a.code_insee
      )`)
    }
    if (filtres.horsZonePrioritaire === true) {
      conditions.push(Prisma.sql`NOT EXISTS (
        SELECT 1 FROM admin.zonage z
        WHERE (z.type = 'QPV' AND public.st_contains(z.geom, a.geom))
           OR (z.type = 'FRR' AND z.code_insee = a.code_insee)
      )`)
    }

    return conditions.length > 0 ? Prisma.sql`AND ${Prisma.join(conditions, ' AND ')}` : Prisma.empty
  }

  private async queryLieux(
    scopeCte: Prisma.Sql,
    whereConditions: Prisma.Sql,
    limitOffset: Prisma.Sql
  ): Promise<Array<LieuInclusionNumeriqueItem>> {
    return prisma.$queryRaw<Array<LieuInclusionNumeriqueItem>>`
      WITH ${scopeCte},
      lieux_page AS (
        SELECT
          l.id, l.nom, l.structure_cartographie_nationale_id, l.updated_at, l.visible_pour_cartographie_nationale,
          COALESCE(l.typologies::text[], '{}') AS typologies,
          a.geom, a.numero_voie, a.nom_voie, a.code_postal, a.nom_commune, a.code_insee
        FROM main.lieu_inclusion l
        JOIN lieux_dans_scope lds ON lds.id = l.id
        LEFT JOIN main.adresse a ON a.id = l.adresse_id
        WHERE true
          ${whereConditions}
        ORDER BY l.nom ASC
        ${limitOffset}
      ),
      accompagnements_ac AS (
        SELECT pal.lieu_id, SUM(p.nb_accompagnements_ac)::int AS nbr
        FROM lieux_page
        INNER JOIN main.personne_affectations_lieu pal ON lieux_page.id = pal.lieu_id
        INNER JOIN main.personne p ON p.id = pal.personne_id
        WHERE p.nb_accompagnements_ac IS NOT NULL
        GROUP BY pal.lieu_id
      )
      SELECT
        l.id,
        l.nom,
        l.structure_cartographie_nationale_id,
        l.updated_at,
        l.visible_pour_cartographie_nationale,
        l.typologies,
        l.numero_voie,
        l.nom_voie,
        l.code_postal,
        l.nom_commune,
        l.code_insee,
        CASE
          WHEN EXISTS (SELECT 1 FROM admin.zonage z WHERE z.type = 'FRR' AND z.code_insee = l.code_insee)
          THEN true ELSE false
        END AS est_frr,
        CASE
          WHEN EXISTS (SELECT 1 FROM admin.zonage z WHERE z.type = 'QPV' AND public.st_contains(z.geom, l.geom))
          THEN true ELSE false
        END AS est_qpv,
        COALESCE(SUM(act.accompagnements)::int, 0) AS nb_accompagnements_coop,
        COALESCE(acc.nbr, 0) AS nb_accompagnements_ac,
        EXISTS (
          SELECT 1 FROM main.personne_affectations_lieu pal
          WHERE pal.lieu_id = l.id AND pal.est_active = true
        ) AS est_actif
      FROM lieux_page l
      LEFT JOIN main.activites_coop act ON act.lieu_id = l.id
      LEFT JOIN accompagnements_ac acc ON acc.lieu_id = l.id
      GROUP BY l.id, l.nom, l.structure_cartographie_nationale_id, l.updated_at, l.visible_pour_cartographie_nationale,
               l.typologies, l.numero_voie, l.nom_voie, l.code_postal, l.nom_commune, l.code_insee,
               l.geom, acc.nbr
      ORDER BY l.nom ASC
    `
  }

  private async queryStats(
    scopeCte: Prisma.Sql,
    whereConditions: Prisma.Sql
  ): Promise<{ totalConseillerNumerique: number; totalLabellise: number }> {
    const result = await prisma.$queryRaw<Array<{ nb_conseillers: bigint; total: bigint }>>`
      WITH ${scopeCte}
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN 'Conseillers numériques' = ANY(l.dispositif_programmes_nationaux) THEN 1 ELSE 0 END) AS nb_conseillers
      FROM main.lieu_inclusion l
      JOIN lieux_dans_scope lds ON lds.id = l.id
      LEFT JOIN main.adresse a ON a.id = l.adresse_id
      WHERE l.dispositif_programmes_nationaux IS NOT NULL
        ${whereConditions}
    `

    return {
      totalConseillerNumerique: Number(result[0]?.nb_conseillers ?? 0),
      totalLabellise: Number(result[0]?.total ?? 0),
    }
  }

  private async queryTotal(scopeCte: Prisma.Sql, whereConditions: Prisma.Sql): Promise<number> {
    const result = await prisma.$queryRaw<Array<{ total: bigint }>>`
      WITH ${scopeCte}
      SELECT COUNT(*) AS total
      FROM main.lieu_inclusion l
      JOIN lieux_dans_scope lds ON lds.id = l.id
      LEFT JOIN main.adresse a ON a.id = l.adresse_id
      WHERE true
        ${whereConditions}
    `

    return Number(result[0]?.total ?? 0)
  }
}
