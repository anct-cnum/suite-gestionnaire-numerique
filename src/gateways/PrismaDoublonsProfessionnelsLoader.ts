import prisma from '../../prisma/prismaClient'
import {
  DoublonProfessionnelReadModel,
  DoublonsProfessionnelsLoader,
  DoublonsProfessionnelsReadModel,
} from '@/use-cases/queries/RecupererDoublonsProfessionnels'

export class PrismaDoublonsProfessionnelsLoader implements DoublonsProfessionnelsLoader {
  // Détection calculée en direct sur main.* (pas de lecture de
  // dataviz.personne_doublons_intra_source : schéma hors Prisma, absent du
  // snapshot local). Critères identiques à la tâche
  // detecter_doublons_intra_source du DAG dataspace personne-reconciliation —
  // toute évolution doit être répercutée des deux côtés.
  async doublons(): Promise<DoublonsProfessionnelsReadModel> {
    return prisma.$queryRaw<Array<DoublonProfessionnelReadModel>>`
      WITH base AS (
        SELECT DISTINCT
          p.id,
          p.prenom,
          p.nom,
          lower(public.unaccent(btrim(p.nom)))    AS nom_n,
          lower(public.unaccent(btrim(p.prenom))) AS prenom_n,
          p.aidant_connect_id,
          p.coop_id,
          p.cn_pg_id,
          p.conseiller_numerique_id,
          pae.structure_administrative_id AS sa_id
        FROM main.personne p
        JOIN main.personne_affectations_emploi pae
          ON pae.personne_id = p.id AND pae.est_active
        WHERE p.deleted_at IS NULL
          AND p.nom IS NOT NULL
          AND p.prenom IS NOT NULL
      ),
      intra AS (
        SELECT 'aidants-connect' AS source,
               b1.id AS p1, b2.id AS p2,
               b1.aidant_connect_id::text AS s1, b2.aidant_connect_id::text AS s2,
               b1.prenom, b1.nom, b1.nom_n, b1.prenom_n, b1.sa_id
        FROM base b1
        JOIN base b2 ON b1.id < b2.id
          AND b1.sa_id = b2.sa_id
          AND b1.nom_n = b2.nom_n AND b1.prenom_n = b2.prenom_n
        WHERE b1.aidant_connect_id IS NOT NULL AND b2.aidant_connect_id IS NOT NULL
        UNION
        SELECT 'coop',
               b1.id, b2.id, b1.coop_id::text, b2.coop_id::text,
               b1.prenom, b1.nom, b1.nom_n, b1.prenom_n, b1.sa_id
        FROM base b1
        JOIN base b2 ON b1.id < b2.id
          AND b1.sa_id = b2.sa_id
          AND b1.nom_n = b2.nom_n AND b1.prenom_n = b2.prenom_n
        WHERE b1.coop_id IS NOT NULL AND b2.coop_id IS NOT NULL
        UNION
        SELECT 'conseiller-numerique',
               b1.id, b2.id,
               COALESCE(b1.cn_pg_id::text, b1.conseiller_numerique_id::text),
               COALESCE(b2.cn_pg_id::text, b2.conseiller_numerique_id::text),
               b1.prenom, b1.nom, b1.nom_n, b1.prenom_n, b1.sa_id
        FROM base b1
        JOIN base b2 ON b1.id < b2.id
          AND b1.sa_id = b2.sa_id
          AND b1.nom_n = b2.nom_n AND b1.prenom_n = b2.prenom_n
        WHERE (b1.cn_pg_id IS NOT NULL OR b1.conseiller_numerique_id IS NOT NULL)
          AND (b2.cn_pg_id IS NOT NULL OR b2.conseiller_numerique_id IS NOT NULL)
      )
      SELECT DISTINCT
        i.source                       AS "source",
        i.p1                           AS "personneId1",
        i.p2                           AS "personneId2",
        i.s1                           AS "sourceId1",
        i.s2                           AS "sourceId2",
        i.prenom                       AS "prenom",
        i.nom                          AS "nom",
        i.sa_id                        AS "structureAdministrativeId",
        COALESCE(sa.denomination_sirene, sa.denomination_antenne, '') AS "structure"
      FROM intra i
      JOIN main.structure_administrative sa ON sa.id = i.sa_id
      ORDER BY "source", i.nom, i.prenom, i.p1`
  }
}
