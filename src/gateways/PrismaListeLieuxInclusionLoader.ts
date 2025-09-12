/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable sonarjs/no-nested-template-literals */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import {
  LieuInclusionNumeriqueItem,
  RecupererLieuxInclusionPort,
  RecupererLieuxInclusionReadModel,
} from '@/use-cases/queries/RecupererLieuxInclusion'

export class PrismaListeLieuxInclusionLoader implements RecupererLieuxInclusionPort {
  async getLieuxWithPagination(page: number, limite = 10, codeDepartement?: string  )
    : Promise<RecupererLieuxInclusionReadModel> {
    const offset = page * limite

    // Récupération du nombre total de lieux
    const totalResult: Array<{ total: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS total
      FROM main.structure s
      INNER JOIN main.adresse a ON a.id = s.adresse_id
      WHERE s.structure_cartographie_nationale_id IS NOT NULL
      ${codeDepartement ? Prisma.sql`AND a.departement = ${codeDepartement}` : Prisma.empty}
    `
    const total = totalResult[0]?.total ?? 0

    // Récupération des lieux avec leurs informations
    const lieux: Array<LieuInclusionNumeriqueItem> = await prisma.$queryRaw`
      WITH structures AS (
        SELECT s.id, s.nom, s.siret, s.categorie_juridique, s.nb_mandats_ac, s.structure_cartographie_nationale_id, a.geom, a.numero_voie, a.nom_voie, a.code_postal, a.nom_commune, a.code_insee
        FROM main.structure s
        INNER JOIN main.adresse a ON a.id = s.adresse_id
        WHERE s.structure_cartographie_nationale_id IS NOT NULL
        ${codeDepartement ? Prisma.sql`AND a.departement = ${codeDepartement}` : Prisma.empty}
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

    const dispositifResult : Array<{ nb_conseillers: bigint; total: bigint }>= await prisma.$queryRaw`SELECT
    COUNT(*) AS total,
      SUM(CASE WHEN 'Conseillers numériques' = ANY(s.dispositif_programmes_nationaux) THEN 1 ELSE 0 END) AS nb_conseillers
    FROM main.structure AS s
    LEFT JOIN main.adresse a ON a.id = s.adresse_id
    WHERE dispositif_programmes_nationaux IS NOT NULL
    ${codeDepartement ? Prisma.sql`AND a.departement = ${codeDepartement}` : Prisma.empty}`

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
}
