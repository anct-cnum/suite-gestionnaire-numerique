import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

export type LieuCoopOption = Readonly<{
  id: string
  nom: string
}>

export class PrismaLieuxCoopLoader {
  async rechercher(recherche: string, scopeFiltre: ScopeFiltre): Promise<ReadonlyArray<LieuCoopOption>> {
    let rows: ReadonlyArray<LieuRow>
    if (scopeFiltre.type === 'structure') {
      rows = await prisma.$queryRaw<ReadonlyArray<LieuRow>>`
        SELECT DISTINCT s.id, s.nom
        FROM main.structure s
        JOIN main.activites_coop a ON a.structure_id = s.id
        WHERE s.id = ${scopeFiltre.id}
          AND s.nom IS NOT NULL
          AND s.nom ILIKE '%' || ${recherche} || '%'
        ORDER BY s.nom
        LIMIT 20
      `
    } else if (scopeFiltre.type === 'departemental') {
      rows = await prisma.$queryRaw<ReadonlyArray<LieuRow>>`
        SELECT DISTINCT s.id, s.nom
        FROM main.structure s
        JOIN main.activites_coop a ON a.structure_id = s.id
        LEFT JOIN main.adresse ad ON ad.id = s.adresse_id
        WHERE s.nom IS NOT NULL
          AND s.nom ILIKE '%' || ${recherche} || '%'
          AND ad.departement = ANY(${[...scopeFiltre.codes]})
        ORDER BY s.nom
        LIMIT 20
      `
    } else {
      rows = await prisma.$queryRaw<ReadonlyArray<LieuRow>>`
        SELECT DISTINCT s.id, s.nom
        FROM main.structure s
        JOIN main.activites_coop a ON a.structure_id = s.id
        WHERE s.nom IS NOT NULL
          AND s.nom ILIKE '%' || ${recherche} || '%'
        ORDER BY s.nom
        LIMIT 20
      `
    }
    return rows.map((row) => ({ id: String(row.id), nom: row.nom }))
  }

  async recuperer(scopeFiltre: ScopeFiltre): Promise<ReadonlyArray<LieuCoopOption>> {
    const rows = await this.#queryLieux(scopeFiltre)
    return rows.map((row) => ({ id: String(row.id), nom: row.nom }))
  }

  async recupererCoopIds(ids: ReadonlyArray<string>): Promise<ReadonlyArray<string>> {
    if (ids.length === 0) return []
    const rows = await prisma.$queryRaw<ReadonlyArray<{ structure_coop_id: string }>>`
      SELECT s.structure_coop_id
      FROM main.structure s
      WHERE s.id = ANY(ARRAY[${Prisma.join(ids.map(Number))}]::int[])
        AND s.structure_coop_id IS NOT NULL
    `
    return rows.map((row) => row.structure_coop_id)
  }

  async recupererParIds(ids: ReadonlyArray<string>): Promise<ReadonlyArray<LieuCoopOption>> {
    if (ids.length === 0) {
      return []
    }
    const rows = await prisma.$queryRaw<ReadonlyArray<LieuRow>>`
      SELECT s.id, s.nom
      FROM main.structure s
      WHERE s.id = ANY(ARRAY[${Prisma.join(ids.map(Number))}]::int[])
        AND s.nom IS NOT NULL
      ORDER BY s.nom
    `
    return rows.map((row) => ({ id: String(row.id), nom: row.nom }))
  }

  async #queryLieux(scopeFiltre: ScopeFiltre): Promise<ReadonlyArray<LieuRow>> {
    if (scopeFiltre.type === 'structure') {
      return prisma.$queryRaw<ReadonlyArray<LieuRow>>`
        SELECT DISTINCT s.id, s.nom
        FROM main.structure s
        JOIN main.activites_coop a ON a.structure_id = s.id
        WHERE s.id = ${scopeFiltre.id}
          AND s.nom IS NOT NULL
        ORDER BY s.nom
      `
    }

    if (scopeFiltre.type === 'departemental') {
      return prisma.$queryRaw<ReadonlyArray<LieuRow>>`
        SELECT DISTINCT s.id, s.nom
        FROM main.structure s
        JOIN main.activites_coop a ON a.structure_id = s.id
        LEFT JOIN main.adresse ad ON ad.id = s.adresse_id
        WHERE s.nom IS NOT NULL
          AND ad.departement = ANY(${[...scopeFiltre.codes]})
        ORDER BY s.nom
      `
    }

    return prisma.$queryRaw<ReadonlyArray<LieuRow>>`
      SELECT DISTINCT s.id, s.nom
      FROM main.structure s
      JOIN main.activites_coop a ON a.structure_id = s.id
      WHERE s.nom IS NOT NULL
      ORDER BY s.nom
    `
  }
}

type LieuRow = Readonly<{
  id: number
  nom: string
}>
