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
      ${codeDepartement ? Prisma.sql`AND a.departement = ${codeDepartement}` : Prisma.sql``}
    `
    const total = totalResult[0]?.total ?? 0

    // Récupération des lieux avec leurs informations
    const lieux: Array<LieuInclusionNumeriqueItem> = await prisma.$queryRaw`
      SELECT
        s.id,
        s.nom,
        s.siret,
        s.categorie_juridique,
        a.numero_voie,
        a.nom_voie,
        a.code_postal,
        a.nom_commune,
        a.code_insee,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM admin.zonage z
            WHERE z.type = 'FRR' AND z.code_insee = a.code_insee
          ) THEN true
          ELSE false
        END AS est_frr,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM admin.zonage z
            WHERE z.type = 'QPV' AND public.st_contains(z.geom, a.geom)
          ) THEN true
          ELSE false
        END AS est_qpv,
        COALESCE(s.nb_mandats_ac, 0) AS nb_mandats_ac,
        COALESCE(
          (SELECT SUM(ac.accompagnements)::int
           FROM main.activites_coop ac
           WHERE ac.structure_id = s.id),
          0
        ) AS nb_accompagnements_coop,
        COALESCE(
          (SELECT SUM(p.nb_accompagnements_ac)::int
           FROM main.personne p
           WHERE p.structure_id = s.id AND p.nb_accompagnements_ac IS NOT NULL),
          0
        ) AS nb_accompagnements_ac
      FROM main.structure s
      INNER JOIN main.adresse a ON a.id = s.adresse_id
      WHERE s.structure_cartographie_nationale_id IS NOT NULL
      ${codeDepartement ? Prisma.sql`AND a.departement = ${codeDepartement}` : Prisma.sql``}
      ORDER BY s.nom ASC
      LIMIT ${limite}
      OFFSET ${offset}
    `

    const dispositifResult : Array<{ nb_conseillers: bigint; nb_france_services: bigint; total: bigint }>= await prisma.$queryRaw`SELECT
    COUNT(*) AS total,
      SUM(CASE WHEN 'France Services' = ANY(s.dispositif_programmes_nationaux) THEN 1 ELSE 0 END) AS nb_france_services,
      SUM(CASE WHEN 'Conseillers numériques' = ANY(s.dispositif_programmes_nationaux) THEN 1 ELSE 0 END) AS nb_conseillers
    FROM main.structure AS s
    LEFT JOIN main.adresse a ON a.id = s.adresse_id
    WHERE dispositif_programmes_nationaux IS NOT NULL
    ${codeDepartement ? Prisma.sql`AND a.departement = ${codeDepartement}` : Prisma.sql``}`

    const dispositif = dispositifResult[0]
    const result = {
      lieux,
      limite,
      page,
      total,
      totalAidantNumerique: Number(dispositif.nb_france_services ?? 0),
      totalConseillerNumerique: Number(dispositif.nb_conseillers ?? 0),
      totalLabellise: Number(dispositif.total ?? 0),
    }
    return result
  }
}
