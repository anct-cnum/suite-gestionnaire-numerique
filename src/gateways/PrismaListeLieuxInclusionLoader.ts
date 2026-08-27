import { buildLieuxDansScopeCte } from './shared/lieuxDansScope'
import { Prisma } from '../../prisma/generated/client'
import prisma from '../../prisma/prismaClient'
import { bornesFraicheur } from '@/shared/fraicheur'
import {
  FiltresListeLieux,
  LieuInclusionNumeriqueItem,
  RecupererLieuxInclusionPort,
  RecupererLieuxInclusionReadModel,
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
    // Les blocs résumé ignorent la recherche par nom (#1292) : seuls le scope et les filtres du drawer s'appliquent.
    const whereConditionsSansRecherche = this.buildWhereConditions({ ...filtres, nom: undefined })
    const limitOffset = Prisma.sql`OFFSET ${pagination.page * pagination.limite} FETCH NEXT ${pagination.limite} ROWS ONLY`
    const filtreEmployeuseActivites = this.buildFiltreEmployeuseActivites(filtres)

    const [totalActifs, totalArchives, totalSansRecherche, lieux, stats] = await Promise.all([
      this.queryTotal(scopeCteActifs, whereConditions),
      this.queryTotal(scopeCteArchives, whereConditions),
      this.queryTotal(scopeCteActifs, whereConditionsSansRecherche),
      this.queryLieux(scopeCte, whereConditions, limitOffset, filtreEmployeuseActivites),
      this.queryStats(scopeCte, whereConditionsSansRecherche),
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
      totalSansRecherche,
    }
  }

  // Un lieu peut être mutualisé entre plusieurs structures : ne compter que les accompagnements
  // de la structure du gestionnaire, pas ceux des autres structures présentes au même lieu.
  private buildFiltreEmployeuseActivites(filtres: FiltresListeLieux): Prisma.Sql {
    return filtres.scopeFiltre.type === 'structure'
      ? Prisma.sql`AND act.structure_employeuse_main_id = ${filtres.scopeFiltre.id}`
      : Prisma.empty
  }

  // Étape 1 — Périmètre d'accès : délégué au module partagé avec le tableau de bord (#1488).
  private buildScopeCte(filtres: FiltresListeLieux): Prisma.Sql {
    return buildLieuxDansScopeCte(filtres.scopeFiltre, filtres.statut, filtres.geographique)
  }

  // Étape 2 — Filtres UI : "parmi les lieux accessibles, lesquels correspondent à la recherche ?"
  private buildWhereConditions(filtres: FiltresListeLieux): Prisma.Sql {
    const conditions: Array<Prisma.Sql> = []

    if (filtres.nom !== undefined && filtres.nom !== '') {
      conditions.push(Prisma.sql`l.nom ILIKE ${motifRecherche(filtres.nom)}`)
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
    if (filtres.fraicheur !== undefined) {
      // Seuils identiques à couleurFraicheur (RG7 #1488) : updated_at ∈ ]apres, jusqua].
      const { apres, jusqua } = bornesFraicheur(filtres.fraicheur.couleur, filtres.fraicheur.now)
      if (apres !== undefined && jusqua !== undefined) {
        conditions.push(Prisma.sql`l.updated_at > ${apres} AND l.updated_at <= ${jusqua}`)
      } else if (apres !== undefined) {
        conditions.push(Prisma.sql`l.updated_at > ${apres}`)
      } else if (jusqua !== undefined) {
        // Sans borne basse (« À actualiser »), les lieux sans date de mise à jour sont inclus.
        conditions.push(Prisma.sql`(l.updated_at IS NULL OR l.updated_at <= ${jusqua})`)
      }
    }

    return conditions.length > 0 ? Prisma.sql`AND ${Prisma.join(conditions, ' AND ')}` : Prisma.empty
  }

  private async queryLieux(
    scopeCte: Prisma.Sql,
    whereConditions: Prisma.Sql,
    limitOffset: Prisma.Sql,
    filtreEmployeuseActivites: Prisma.Sql
  ): Promise<Array<LieuInclusionNumeriqueItem>> {
    return prisma.$queryRaw<Array<LieuInclusionNumeriqueItem>>`
      WITH ${scopeCte},
      lieux_page AS (
        SELECT
          l.id, l.nom, l.structure_cartographie_nationale_id, l.updated_at, l.deleted_at,
          l.visible_pour_cartographie_nationale, l.structure_coop_id,
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
        l.id::text AS id,
        l.nom,
        l.structure_cartographie_nationale_id,
        l.updated_at,
        l.deleted_at,
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
        COALESCE(SUM(act.accompagnements_count)::int, 0) AS nb_accompagnements_coop,
        COALESCE(acc.nbr, 0) AS nb_accompagnements_ac
      FROM lieux_page l
      LEFT JOIN coop.activites act ON act.structure_id = l.structure_coop_id AND act.suppression IS NULL
        ${filtreEmployeuseActivites}
      LEFT JOIN accompagnements_ac acc ON acc.lieu_id = l.id
      GROUP BY l.id, l.nom, l.structure_cartographie_nationale_id, l.updated_at, l.deleted_at,
               l.visible_pour_cartographie_nationale,
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

// Recherche partielle insensible à la casse : échappe les jokers LIKE (\ % _) de la saisie utilisateur.
function motifRecherche(valeur: string): string {
  return `%${valeur.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`
}
