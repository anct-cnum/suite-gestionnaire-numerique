/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { buildWhereClause } from '@/shared/prismaQueryHelpers'
import {
  LieuInclusionNumeriqueItem,
  RecupererLieuxInclusionPort,
  RecupererLieuxInclusionReadModel,
} from '@/use-cases/queries/RecupererLieuxInclusion'

export class PrismaListeLieuxInclusionLoader implements RecupererLieuxInclusionPort {
  async getLieuxWithPagination(
    page: number,
    limite = 10,
    codeDepartement?: string,
    typeStructure?: string,
    qpv?: boolean,
    frr?: boolean,
    codeRegion?: string,
    horsZonePrioritaire?: boolean
  ): Promise<RecupererLieuxInclusionReadModel> {
    const offset = page * limite

    const whereClause = buildWhereClause(
      [Prisma.sql`s.structure_cartographie_nationale_id IS NOT NULL`],
      { codeDepartement, codeRegion, typeStructure },
      { frr, horsZonePrioritaire, qpv }
    )

    // Récupération du nombre total de lieux
    const totalResult: Array<{ total: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS total
      FROM main.structure s
      INNER JOIN main.adresse a ON a.id = s.adresse_id
      LEFT JOIN reference.categories_juridiques ref ON s.categorie_juridique = ref.code
      ${whereClause}
    `
    const total = totalResult[0]?.total ?? 0

    // Récupération des lieux avec leurs informations
    const lieux: Array<LieuInclusionNumeriqueItem> = await prisma.$queryRaw`
      WITH structures AS (
        SELECT s.id, s.nom, s.siret, s.categorie_juridique, s.nb_mandats_ac, s.structure_cartographie_nationale_id, a.geom, a.numero_voie, a.nom_voie, a.code_postal, a.nom_commune, a.code_insee
        FROM main.structure s
        INNER JOIN main.adresse a ON a.id = s.adresse_id
        LEFT JOIN reference.categories_juridiques ref ON s.categorie_juridique = ref.code
        ${whereClause}
        ORDER BY s.nom ASC
        OFFSET ${offset}
        FETCH NEXT ${limite} ROWS ONLY
      ),
      accompagnements_ac AS (
        SELECT aff.structure_id, SUM(p.nb_accompagnements_ac)::int AS nbr
        FROM structures
        INNER JOIN main.personne_affectations aff ON structures.id = aff.structure_id
        INNER JOIN main.personne p ON p.id = aff.personne_id
        WHERE p.nb_accompagnements_ac IS NOT NULL
        GROUP BY aff.structure_id
      )
      SELECT
        s.id,
        s.nom,
        s.siret,
        s.structure_cartographie_nationale_id,
        ref.nom as categorie_juridique,
        s.numero_voie,
        s.nom_voie,
        s.code_postal,
        s.nom_commune,
        s.code_insee,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM admin.zonage z
            WHERE z.type = 'FRR' AND z.code_insee = s.code_insee
          ) THEN true
          ELSE false
        END AS est_frr,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM admin.zonage z
            WHERE z.type = 'QPV' AND public.st_contains(z.geom, s.geom)
          ) THEN true
          ELSE false
        END AS est_qpv,
        COALESCE(s.nb_mandats_ac, 0) AS nb_mandats_ac,
        COALESCE(SUM(act.accompagnements)::int, 0) AS nb_accompagnements_coop,
        COALESCE(acc.nbr, 0) AS nb_accompagnements_ac
      FROM structures s
      LEFT join reference.categories_juridiques ref on s.categorie_juridique = ref.code
      LEFT JOIN main.activites_coop act ON act.structure_id = s.id
      LEFT JOIN accompagnements_ac acc ON acc.structure_id = s.id
      GROUP BY s.id, s.nom, s.siret, s.structure_cartographie_nationale_id, ref.nom, s.numero_voie, s.nom_voie, s.code_postal, s.nom_commune, s.code_insee, s.nb_mandats_ac, s.geom, acc.nbr
      ORDER BY s.nom ASC
    `

    // Pour la requête dispositif, on utilise le nom de la catégorie juridique
    const dispositifConditions = [Prisma.sql`dispositif_programmes_nationaux IS NOT NULL`]

    if (codeDepartement) {
      dispositifConditions.push(Prisma.sql`a.departement = ${codeDepartement}`)
    }

    if (typeStructure) {
      dispositifConditions.push(Prisma.sql`ref.nom = ${typeStructure}`)
    }

    if (qpv === true) {
      dispositifConditions.push(Prisma.sql`EXISTS (
        SELECT 1 FROM admin.zonage z
        WHERE z.type = 'QPV' AND public.st_contains(z.geom, a.geom)
      )`)
    }

    if (frr === true) {
      dispositifConditions.push(Prisma.sql`EXISTS (
        SELECT 1 FROM admin.zonage z
        WHERE z.type = 'FRR' AND z.code_insee = a.code_insee
      )`)
    }

    if (horsZonePrioritaire === true) {
      dispositifConditions.push(Prisma.sql`NOT EXISTS (
        SELECT 1 FROM admin.zonage z
        WHERE (z.type = 'QPV' AND public.st_contains(z.geom, a.geom))
           OR (z.type = 'FRR' AND z.code_insee = a.code_insee)
      )`)
    }

    const dispositifWhereClause = dispositifConditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(dispositifConditions, ' AND ')}`
      : Prisma.empty

    const dispositifResult : Array<{ nb_conseillers: bigint; total: bigint }>= await prisma.$queryRaw`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN 'Conseillers numériques' = ANY(s.dispositif_programmes_nationaux) THEN 1 ELSE 0 END) AS nb_conseillers
      FROM main.structure AS s
      LEFT JOIN main.adresse a ON a.id = s.adresse_id
      LEFT JOIN reference.categories_juridiques ref ON s.categorie_juridique = ref.code
      ${dispositifWhereClause}
    `

    const dispositif = dispositifResult[0]
    return {
      lieux,
      limite,
      page,
      total,
      totalConseillerNumerique: Number(dispositif.nb_conseillers ?? 0),
      totalLabellise: Number(dispositif.total ?? 0),
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
      WHERE main.structure.structure_cartographie_nationale_id IS NOT NULL
        AND reference.categories_juridiques.nom IS NOT NULL
      ORDER BY reference.categories_juridiques.nom ASC
    `
  }
}
