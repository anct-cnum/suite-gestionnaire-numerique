import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

export type StructureEmployeuseOption = Readonly<{
  id: string
  nom: string
}>

export class PrismaStructuresEmployeusesCoopLoader {
  async rechercher(recherche: string, scopeFiltre: ScopeFiltre): Promise<ReadonlyArray<StructureEmployeuseOption>> {
    let rows: ReadonlyArray<StructureRow>

    if (scopeFiltre.type === 'structure') {
      rows = await prisma.$queryRaw<ReadonlyArray<StructureRow>>`
        SELECT DISTINCT s.id, s.nom
        FROM main.structure s
        JOIN min.personne_enrichie pe ON pe.structure_employeuse_id = s.id
        WHERE s.nom IS NOT NULL
          AND s.nom ILIKE '%' || ${recherche} || '%'
          AND s.id = ${scopeFiltre.id}
          AND pe.is_mediateur = true
          AND pe.coop_id IS NOT NULL
          AND pe.deleted_at IS NULL
          AND pe.aidant_connect_id IS NULL
        ORDER BY s.nom
        LIMIT 20
      `
    } else if (scopeFiltre.type === 'departemental') {
      rows = await prisma.$queryRaw<ReadonlyArray<StructureRow>>`
        SELECT DISTINCT s.id, s.nom
        FROM main.structure s
        JOIN min.personne_enrichie pe ON pe.structure_employeuse_id = s.id
        LEFT JOIN main.adresse ad ON ad.id = s.adresse_id
        WHERE s.nom IS NOT NULL
          AND s.nom ILIKE '%' || ${recherche} || '%'
          AND ad.departement = ANY(${[...scopeFiltre.codes]})
          AND pe.is_mediateur = true
          AND pe.coop_id IS NOT NULL
          AND pe.deleted_at IS NULL
          AND pe.aidant_connect_id IS NULL
        ORDER BY s.nom
        LIMIT 20
      `
    } else {
      rows = await prisma.$queryRaw<ReadonlyArray<StructureRow>>`
        SELECT DISTINCT s.id, s.nom
        FROM main.structure s
        JOIN min.personne_enrichie pe ON pe.structure_employeuse_id = s.id
        WHERE s.nom IS NOT NULL
          AND s.nom ILIKE '%' || ${recherche} || '%'
          AND pe.is_mediateur = true
          AND pe.coop_id IS NOT NULL
          AND pe.deleted_at IS NULL
          AND pe.aidant_connect_id IS NULL
        ORDER BY s.nom
        LIMIT 20
      `
    }

    return rows.map((row) => ({ id: String(row.id), nom: row.nom }))
  }

  async recupererParIds(ids: ReadonlyArray<string>): Promise<ReadonlyArray<StructureEmployeuseOption>> {
    if (ids.length === 0) return []

    const rows = await prisma.$queryRaw<ReadonlyArray<StructureRow>>`
      SELECT DISTINCT s.id, s.nom
      FROM main.structure s
      WHERE s.id = ANY(ARRAY[${Prisma.join(ids.map(Number))}]::int[])
        AND s.nom IS NOT NULL
      ORDER BY s.nom
    `
    return rows.map((row) => ({ id: String(row.id), nom: row.nom }))
  }
}

type StructureRow = Readonly<{
  id: number
  nom: string
}>
