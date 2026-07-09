import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'

// Les affectations d'emploi passees (pae.est_active = false) sont volontairement
// incluses : les statistiques doivent faire ressortir l'activite des mediateurs
// qui ne sont plus sous contrat aujourd'hui mais qui l'ont ete (#1472).
export class PrismaMediateursCoopLoader {
  async recupererCoopIdsParStructure(structureId: number): Promise<ReadonlyArray<string>> {
    const rows = await prisma.$queryRaw<ReadonlyArray<{ coop_id: string }>>`
      SELECT pe.coop_id
      FROM min.personne_enrichie pe
      WHERE (
        pe.structure_employeuse_id = ${structureId}
        OR EXISTS (
          SELECT 1 FROM main.personne_affectations_emploi pae
          WHERE pae.personne_id = pe.id
            AND pae.structure_administrative_id = ${structureId}
        )
      )
      AND pe.is_mediateur = true
      AND pe.coop_id IS NOT NULL
      AND pe.deleted_at IS NULL
      AND pe.aidant_connect_id IS NULL
    `
    return rows.map((row) => row.coop_id)
  }

  async recupererCoopIdsParStructures(structureIds: ReadonlyArray<string>): Promise<ReadonlyArray<string>> {
    if (structureIds.length === 0) return []
    const ids = structureIds.map(Number).filter(Boolean)
    const rows = await prisma.$queryRaw<ReadonlyArray<{ coop_id: string }>>`
      SELECT DISTINCT pe.coop_id
      FROM min.personne_enrichie pe
      WHERE (
        pe.structure_employeuse_id = ANY(ARRAY[${Prisma.join(ids)}]::int[])
        OR EXISTS (
          SELECT 1 FROM main.personne_affectations_emploi pae
          WHERE pae.personne_id = pe.id
            AND pae.structure_administrative_id = ANY(ARRAY[${Prisma.join(ids)}]::int[])
        )
      )
      AND pe.is_mediateur = true
      AND pe.coop_id IS NOT NULL
      AND pe.deleted_at IS NULL
      AND pe.aidant_connect_id IS NULL
    `
    return rows.map((row) => row.coop_id)
  }
}
