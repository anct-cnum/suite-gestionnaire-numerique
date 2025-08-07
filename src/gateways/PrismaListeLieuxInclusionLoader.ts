import prisma from '../../prisma/prismaClient'
import { 
  LieuInclusionNumeriqueItem,
  RecupererLieuxInclusionPort, 
  RecupererLieuxInclusionReadModel, 
} from '@/use-cases/queries/RecupererLieuxInclusion'

export class PrismaListeLieuxInclusionLoader implements RecupererLieuxInclusionPort {
  async getLieuxWithPagination(page: number, limite = 10): Promise<RecupererLieuxInclusionReadModel> {
    const offset = page * limite

    // Récupération du nombre total de lieux
    const totalResult: Array<{ total: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS total
      FROM main.structure
      WHERE structure_cartographie_nationale_id IS NOT NULL
    `
    const total = totalResult[0]?.total ?? 0

    // Récupération des lieux avec leurs informations
    const lieux: Array<LieuInclusionNumeriqueItem> = await prisma.$queryRaw`
      SELECT 
        s.id,
        s.nom,
        s.siret,
        s.categorie_juridique,
        cj.nom AS type_structure,
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
      LEFT JOIN reference.categories_juridiques cj ON s.categorie_juridique = cj.code
      WHERE s.structure_cartographie_nationale_id IS NOT NULL
      ORDER BY s.nom ASC
      LIMIT ${limite}
      OFFSET ${offset}
    `

    return {
      lieux,
      limite,
      page,
      total,
    }
  }
}