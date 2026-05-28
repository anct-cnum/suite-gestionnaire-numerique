import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import departements from '../../ressources/departements.json'
import {
  FiltresListeLieux,
  LieuInclusionNumeriqueItem,
  RecupererLieuxInclusionPort,
  RecupererLieuxInclusionReadModel,
} from '@/use-cases/queries/RecupererLieuxInclusion'

// Refonte 2026 : ce loader cible desormais main.lieu_inclusion (et plus
// main.structure legacy). Les attributs "legaux" (siret, categorie_juridique,
// nb_mandats_ac) viennent de main.structure_administrative, joint via la
// table d'asso main.lieu_inclusion_structure_administrative (cardinalite N:N).
// Pour les colonnes scalaires d'affichage, on prend une SA "principale" via
// LATERAL LIMIT 1 ordonne par sa.id ASC pour la stabilite. Cf doc Next §N8
// sur le risque de double comptage en cas de plusieurs SA pour un meme lieu.
export class PrismaListeLieuxInclusionLoader implements RecupererLieuxInclusionPort {
  async getLieux(filtres: FiltresListeLieux): Promise<RecupererLieuxInclusionReadModel> {
    const { pagination } = filtres
    const scopeCte = this.buildScopeCte(filtres)
    const whereConditions = this.buildWhereConditions(filtres)
    const limitOffset = Prisma.sql`OFFSET ${pagination.page * pagination.limite} FETCH NEXT ${pagination.limite} ROWS ONLY`

    const [total, lieux, stats] = await Promise.all([
      this.queryTotal(scopeCte, whereConditions),
      this.queryLieux(scopeCte, whereConditions, limitOffset),
      this.queryStats(scopeCte, whereConditions),
    ])

    return {
      lieux,
      limite: pagination.limite,
      page: pagination.page,
      total,
      totalConseillerNumerique: stats.totalConseillerNumerique,
      totalLabellise: stats.totalLabellise,
    }
  }

  async getTypesStructure(): Promise<Array<{ code: string; nom: string }>> {
    return prisma.$queryRaw`
      SELECT DISTINCT
        reference.categories_juridiques.code,
        reference.categories_juridiques.nom
      FROM main.structure_administrative
      JOIN reference.categories_juridiques
        ON reference.categories_juridiques.code = LEFT(main.structure_administrative.categorie_juridique, 2)
      WHERE reference.categories_juridiques.nom IS NOT NULL
      ORDER BY reference.categories_juridiques.nom ASC
    `
  }

  // Étape 1 — Périmètre d'accès : "quels lieux ai-je le droit de voir ?"
  // Le filtre géographique explicite (UI, admin seulement) prend le pas sur le scope departemental.
  private buildScopeCte(filtres: FiltresListeLieux): Prisma.Sql {
    const { geographique, scopeFiltre } = filtres

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
      )`
    }

    if (scopeFiltre.type === 'departemental') {
      const codesDepartements = [...scopeFiltre.codes]
      return Prisma.sql`lieux_dans_scope AS (
        SELECT l.id
        FROM main.lieu_inclusion l
        LEFT JOIN main.adresse a ON a.id = l.adresse_id
        WHERE a.departement = ANY(${codesDepartements})
      )`
    }

    if (scopeFiltre.type === 'structure') {
      // scopeFiltre.id refere desormais a une structure_administrative.id.
      // Un gestionnaire de SA voit les lieux : (a) associes directement a sa
      // SA via l'asso, (b) ou ou travaillent des personnes employees par sa SA
      // (paf_lieu + paf_emploi croises, plus min.personne_enrichie pour les
      // mediateurs Coop sans paf_emploi).
      return Prisma.sql`lieux_dans_scope AS (
        SELECT l.id
        FROM main.lieu_inclusion l
        WHERE EXISTS (
            SELECT 1 FROM main.lieu_inclusion_structure_administrative asso
            WHERE asso.lieu_id = l.id AND asso.structure_administrative_id = ${scopeFiltre.id}
          )
          OR EXISTS (
            SELECT 1 FROM main.personne_affectations_lieu pal
            WHERE pal.lieu_id = l.id AND pal.est_active = true
              AND pal.personne_id IN (
                SELECT pae.personne_id FROM main.personne_affectations_emploi pae
                WHERE pae.structure_administrative_id = ${scopeFiltre.id} AND pae.est_active = true
                UNION
                SELECT pe.id FROM min.personne_enrichie pe
                WHERE pe.structure_employeuse_id = ${scopeFiltre.id}
              )
          )
      )`
    }

    // Scope national : aucune restriction d'accès
    return Prisma.sql`lieux_dans_scope AS (
      SELECT l.id FROM main.lieu_inclusion l
    )`
  }

  // Étape 2 — Filtres UI : "parmi les lieux accessibles, lesquels correspondent à la recherche ?"
  private buildWhereConditions(filtres: FiltresListeLieux): Prisma.Sql {
    const conditions: Array<Prisma.Sql> = []

    if (filtres.typeStructure) {
      // typologie juridique vit cote SA depuis la refonte : on filtre via la
      // table d'asso. EXISTS evite le double comptage si plusieurs SA matchent.
      conditions.push(Prisma.sql`EXISTS (
        SELECT 1
        FROM main.lieu_inclusion_structure_administrative asso_filtre
        JOIN main.structure_administrative sa_filtre
          ON sa_filtre.id = asso_filtre.structure_administrative_id
        WHERE asso_filtre.lieu_id = l.id
          AND LEFT(sa_filtre.categorie_juridique, 2) = ${filtres.typeStructure}
      )`)
    }
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
          l.id, l.nom, l.structure_cartographie_nationale_id,
          sa_first.siret, sa_first.categorie_juridique, sa_first.nb_mandats_ac,
          a.geom, a.numero_voie, a.nom_voie, a.code_postal, a.nom_commune, a.code_insee
        FROM main.lieu_inclusion l
        JOIN lieux_dans_scope lds ON lds.id = l.id
        LEFT JOIN main.adresse a ON a.id = l.adresse_id
        LEFT JOIN LATERAL (
          SELECT sa.siret, sa.categorie_juridique, sa.nb_mandats_ac
          FROM main.lieu_inclusion_structure_administrative asso
          JOIN main.structure_administrative sa ON sa.id = asso.structure_administrative_id
          WHERE asso.lieu_id = l.id
          ORDER BY sa.id
          LIMIT 1
        ) sa_first ON true
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
        l.siret,
        l.structure_cartographie_nationale_id,
        ref.nom AS categorie_juridique,
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
        COALESCE(l.nb_mandats_ac, 0) AS nb_mandats_ac,
        COALESCE(SUM(act.accompagnements)::int, 0) AS nb_accompagnements_coop,
        COALESCE(acc.nbr, 0) AS nb_accompagnements_ac
      FROM lieux_page l
      LEFT JOIN reference.categories_juridiques ref ON l.categorie_juridique = ref.code
      LEFT JOIN main.activites_coop act ON act.lieu_id = l.id
      LEFT JOIN accompagnements_ac acc ON acc.lieu_id = l.id
      GROUP BY l.id, l.nom, l.siret, l.structure_cartographie_nationale_id, ref.nom,
               l.numero_voie, l.nom_voie, l.code_postal, l.nom_commune, l.code_insee,
               l.nb_mandats_ac, l.geom, acc.nbr
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
