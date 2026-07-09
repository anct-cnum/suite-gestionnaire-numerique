import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

export type StructureEmployeuseOption = Readonly<{
  label: string
  value: string
}>

// Refonte 2026 : `min.personne_enrichie.structure_employeuse_id` pointe
// désormais sur `main.structure_administrative.id` (cf V092 dataspace).
// Le nom exposé est COALESCE(denomination_antenne, denomination_sirene) :
// denomination_antenne permet de distinguer les "antennes" d'un grand
// réseau partageant le SIRET du siège (Emmaüs Connect, Reconnect, …).

export class PrismaStructuresEmployeusesCoopLoader {
  async rechercher(recherche: string, scopeFiltre: ScopeFiltre): Promise<ReadonlyArray<StructureEmployeuseOption>> {
    let rows: ReadonlyArray<StructureRow>

    if (scopeFiltre.type === 'structure') {
      rows = await prisma.$queryRaw<ReadonlyArray<StructureRow>>`
        SELECT DISTINCT sa.id, COALESCE(sa.denomination_antenne, sa.denomination_sirene) AS nom
        FROM main.structure_administrative sa
        JOIN min.personne_enrichie pe ON pe.structure_employeuse_id = sa.id
        WHERE COALESCE(sa.denomination_antenne, sa.denomination_sirene) IS NOT NULL
          AND COALESCE(sa.denomination_antenne, sa.denomination_sirene) ILIKE '%' || ${recherche} || '%'
          AND sa.id = ${scopeFiltre.id}
          AND pe.is_mediateur = true
          AND pe.coop_id IS NOT NULL
          AND pe.deleted_at IS NULL
          AND pe.aidant_connect_id IS NULL
        ORDER BY COALESCE(sa.denomination_antenne, sa.denomination_sirene)
        LIMIT 20
      `
    } else if (scopeFiltre.type === 'departemental') {
      rows = await prisma.$queryRaw<ReadonlyArray<StructureRow>>`
        SELECT DISTINCT sa.id, COALESCE(sa.denomination_antenne, sa.denomination_sirene) AS nom
        FROM main.structure_administrative sa
        JOIN min.personne_enrichie pe ON pe.structure_employeuse_id = sa.id
        LEFT JOIN main.adresse ad ON ad.id = sa.adresse_id
        WHERE COALESCE(sa.denomination_antenne, sa.denomination_sirene) IS NOT NULL
          AND COALESCE(sa.denomination_antenne, sa.denomination_sirene) ILIKE '%' || ${recherche} || '%'
          AND ad.departement = ANY(${[...scopeFiltre.codes]})
          AND pe.is_mediateur = true
          AND pe.coop_id IS NOT NULL
          AND pe.deleted_at IS NULL
          AND pe.aidant_connect_id IS NULL
        ORDER BY COALESCE(sa.denomination_antenne, sa.denomination_sirene)
        LIMIT 20
      `
    } else {
      rows = await prisma.$queryRaw<ReadonlyArray<StructureRow>>`
        SELECT DISTINCT sa.id, COALESCE(sa.denomination_antenne, sa.denomination_sirene) AS nom
        FROM main.structure_administrative sa
        JOIN min.personne_enrichie pe ON pe.structure_employeuse_id = sa.id
        WHERE COALESCE(sa.denomination_antenne, sa.denomination_sirene) IS NOT NULL
          AND COALESCE(sa.denomination_antenne, sa.denomination_sirene) ILIKE '%' || ${recherche} || '%'
          AND pe.is_mediateur = true
          AND pe.coop_id IS NOT NULL
          AND pe.deleted_at IS NULL
          AND pe.aidant_connect_id IS NULL
        ORDER BY COALESCE(sa.denomination_antenne, sa.denomination_sirene)
        LIMIT 20
      `
    }

    return rows.map((row) => ({ label: row.nom, value: String(row.id) }))
  }

  async recupererParIds(ids: ReadonlyArray<string>): Promise<ReadonlyArray<StructureEmployeuseOption>> {
    if (ids.length === 0) return []

    const rows = await prisma.$queryRaw<ReadonlyArray<StructureRow>>`
      SELECT DISTINCT sa.id, COALESCE(sa.denomination_antenne, sa.denomination_sirene) AS nom
      FROM main.structure_administrative sa
      WHERE sa.id = ANY(ARRAY[${Prisma.join(ids.map(Number))}]::int[])
        AND COALESCE(sa.denomination_antenne, sa.denomination_sirene) IS NOT NULL
      ORDER BY COALESCE(sa.denomination_antenne, sa.denomination_sirene)
    `
    return rows.map((row) => ({ label: row.nom, value: String(row.id) }))
  }
}

type StructureRow = Readonly<{
  id: number
  nom: string
}>
