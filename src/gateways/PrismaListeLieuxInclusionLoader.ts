import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import departements from '../../ressources/departements.json'
import {
  FiltresListeLieux,
  LieuInclusionNumeriqueItem,
  RecupererLieuxInclusionPort,
  RecupererLieuxInclusionReadModel,
} from '@/use-cases/queries/RecupererLieuxInclusion'

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
      FROM main.structure
      JOIN reference.categories_juridiques
        ON reference.categories_juridiques.code = LEFT(main.structure.categorie_juridique, 2)
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
        SELECT s.id
        FROM main.structure s
        LEFT JOIN main.adresse a ON a.id = s.adresse_id
        WHERE a.departement = ANY(${codesDepartements})
      )`
    }

    if (scopeFiltre.type === 'departemental') {
      const codesDepartements = [...scopeFiltre.codes]
      return Prisma.sql`lieux_dans_scope AS (
        SELECT s.id
        FROM main.structure s
        LEFT JOIN main.adresse a ON a.id = s.adresse_id
        WHERE a.departement = ANY(${codesDepartements})
      )`
    }

    if (scopeFiltre.type === 'structure') {
      return Prisma.sql`lieux_dans_scope AS (
        SELECT s.id
        FROM main.structure s
        WHERE s.id = ${scopeFiltre.id}
          OR EXISTS (
            SELECT 1 FROM main.personne_affectations pa_lieu
            WHERE pa_lieu.structure_id = s.id AND pa_lieu.est_active = true
              AND pa_lieu.personne_id IN (
                SELECT pa.personne_id FROM main.personne_affectations pa
                WHERE pa.structure_id = ${scopeFiltre.id} AND pa.est_active = true
                UNION
                SELECT pe.id FROM min.personne_enrichie pe
                WHERE pe.structure_employeuse_id = ${scopeFiltre.id}
              )
          )
      )`
    }

    // Scope national : aucune restriction d'accès
    return Prisma.sql`lieux_dans_scope AS (
      SELECT s.id FROM main.structure s
    )`
  }

  // Étape 2 — Filtres UI : "parmi les lieux accessibles, lesquels correspondent à la recherche ?"
  private buildWhereConditions(filtres: FiltresListeLieux): Prisma.Sql {
    const conditions: Array<Prisma.Sql> = []

    if (filtres.typeStructure) {
      conditions.push(Prisma.sql`LEFT(s.categorie_juridique, 2) = ${filtres.typeStructure}`)
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
          s.id, s.nom, s.siret, s.structure_cartographie_nationale_id,
          s.categorie_juridique, s.nb_mandats_ac,
          a.geom, a.numero_voie, a.nom_voie, a.code_postal, a.nom_commune, a.code_insee
        FROM main.structure s
        JOIN lieux_dans_scope lds ON lds.id = s.id
        LEFT JOIN main.adresse a ON a.id = s.adresse_id
        WHERE true
          ${whereConditions}
        ORDER BY s.nom ASC
        ${limitOffset}
      ),
      accompagnements_ac AS (
        SELECT aff.structure_id, SUM(p.nb_accompagnements_ac)::int AS nbr
        FROM lieux_page
        INNER JOIN main.personne_affectations aff ON lieux_page.id = aff.structure_id
        INNER JOIN main.personne p ON p.id = aff.personne_id
        WHERE p.nb_accompagnements_ac IS NOT NULL
        GROUP BY aff.structure_id
      )
      SELECT
        s.id,
        s.nom,
        s.siret,
        s.structure_cartographie_nationale_id,
        ref.nom AS categorie_juridique,
        s.numero_voie,
        s.nom_voie,
        s.code_postal,
        s.nom_commune,
        s.code_insee,
        CASE
          WHEN EXISTS (SELECT 1 FROM admin.zonage z WHERE z.type = 'FRR' AND z.code_insee = s.code_insee)
          THEN true ELSE false
        END AS est_frr,
        CASE
          WHEN EXISTS (SELECT 1 FROM admin.zonage z WHERE z.type = 'QPV' AND public.st_contains(z.geom, s.geom))
          THEN true ELSE false
        END AS est_qpv,
        COALESCE(s.nb_mandats_ac, 0) AS nb_mandats_ac,
        COALESCE(SUM(act.accompagnements)::int, 0) AS nb_accompagnements_coop,
        COALESCE(acc.nbr, 0) AS nb_accompagnements_ac
      FROM lieux_page s
      LEFT JOIN reference.categories_juridiques ref ON s.categorie_juridique = ref.code
      LEFT JOIN main.activites_coop act ON act.structure_id = s.id
      LEFT JOIN accompagnements_ac acc ON acc.structure_id = s.id
      GROUP BY s.id, s.nom, s.siret, s.structure_cartographie_nationale_id, ref.nom,
               s.numero_voie, s.nom_voie, s.code_postal, s.nom_commune, s.code_insee,
               s.nb_mandats_ac, s.geom, acc.nbr
      ORDER BY s.nom ASC
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
        SUM(CASE WHEN 'Conseillers numériques' = ANY(s.dispositif_programmes_nationaux) THEN 1 ELSE 0 END) AS nb_conseillers
      FROM main.structure s
      JOIN lieux_dans_scope lds ON lds.id = s.id
      LEFT JOIN main.adresse a ON a.id = s.adresse_id
      WHERE dispositif_programmes_nationaux IS NOT NULL
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
      FROM main.structure s
      JOIN lieux_dans_scope lds ON lds.id = s.id
      LEFT JOIN main.adresse a ON a.id = s.adresse_id
      WHERE true
        ${whereConditions}
    `

    return Number(result[0]?.total ?? 0)
  }
}
