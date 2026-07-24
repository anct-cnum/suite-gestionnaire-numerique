import prisma from '../../prisma/prismaClient'
import { AccompagnementsAcStructureLoader } from '@/use-cases/queries/RecupererActivitesStructure'

// Accompagnements Aidants Connect déclarés par les personnes qui sont ou ont été
// rattachées à la structure (même population que PrismaMediateursCoopLoader : les affectations
// d'emploi passées sont incluses, #1472).
export class PrismaAccompagnementsAcStructureLoader implements AccompagnementsAcStructureLoader {
  async recupererParMoisParStructure(structureId: number): Promise<ReadonlyArray<{ mois: string; total: number }>> {
    const rows = await prisma.$queryRaw<ReadonlyArray<{ mois: string; total: bigint }>>`
      SELECT to_char(acm.mois, 'YYYY-MM') AS mois, SUM(acm.nb_accompagnements) AS total
      FROM main.ac_accompagnements_mensuels acm
      INNER JOIN min.personne_enrichie pe ON pe.aidant_connect_id = acm.aidant_connect_id
      WHERE (
        pe.structure_employeuse_id = ${structureId}
        OR EXISTS (
          SELECT 1 FROM main.personne_affectations_emploi pae
          WHERE pae.personne_id = pe.id
            AND pae.structure_administrative_id = ${structureId}
        )
      )
      AND pe.deleted_at IS NULL
      GROUP BY acm.mois
      ORDER BY acm.mois
    `
    return rows.map((row) => ({ mois: row.mois, total: Number(row.total) }))
  }

  async recupererTotalParStructure(structureId: number): Promise<number> {
    const rows = await prisma.$queryRaw<ReadonlyArray<{ total: bigint }>>`
      SELECT COALESCE(SUM(pe.nb_accompagnements_ac), 0) AS total
      FROM min.personne_enrichie pe
      WHERE (
        pe.structure_employeuse_id = ${structureId}
        OR EXISTS (
          SELECT 1 FROM main.personne_affectations_emploi pae
          WHERE pae.personne_id = pe.id
            AND pae.structure_administrative_id = ${structureId}
        )
      )
      AND pe.deleted_at IS NULL
    `
    return Number(rows[0]?.total ?? 0)
  }
}
