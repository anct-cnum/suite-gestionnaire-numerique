import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

export type MediateurCoopOption = Readonly<{
  id: number
  label: string
}>

export class PrismaMediateursCoopLoader {
  async rechercher(recherche: string, scopeFiltre: ScopeFiltre): Promise<ReadonlyArray<MediateurCoopOption>> {
    let personnes: ReadonlyArray<PersonneRow>
    if (scopeFiltre.type === 'departemental') {
      personnes = await prisma.$queryRaw<ReadonlyArray<PersonneRow>>`
        SELECT DISTINCT pe.id, pe.prenom, pe.nom
        FROM min.personne_enrichie pe
        LEFT JOIN main.structure str ON str.id = pe.structure_employeuse_id
        LEFT JOIN main.adresse ad ON ad.id = str.adresse_id
        WHERE pe.is_mediateur = true
          AND pe.coop_id IS NOT NULL
          AND pe.deleted_at IS NULL
          AND pe.aidant_connect_id IS NULL
          AND ad.departement = ANY(${[...scopeFiltre.codes]})
          AND (pe.nom ILIKE '%' || ${recherche} || '%' OR pe.prenom ILIKE '%' || ${recherche} || '%')
        ORDER BY pe.nom, pe.prenom
        LIMIT 20
      `
    } else if (scopeFiltre.type === 'structure') {
      personnes = await prisma.$queryRaw<ReadonlyArray<PersonneRow>>`
        SELECT DISTINCT pe.id, pe.prenom, pe.nom
        FROM min.personne_enrichie pe
        WHERE pe.is_mediateur = true
          AND pe.coop_id IS NOT NULL
          AND pe.deleted_at IS NULL
          AND pe.aidant_connect_id IS NULL
          AND (pe.nom ILIKE '%' || ${recherche} || '%' OR pe.prenom ILIKE '%' || ${recherche} || '%')
          AND (
            pe.structure_employeuse_id = ${scopeFiltre.id}
            OR EXISTS (
              SELECT 1 FROM main.personne_affectations aff
              WHERE aff.personne_id = pe.id
                AND aff.est_active = true
                AND aff.structure_id = ${scopeFiltre.id}
            )
          )
        ORDER BY pe.nom, pe.prenom
        LIMIT 20
      `
    } else {
      personnes = await prisma.$queryRaw<ReadonlyArray<PersonneRow>>`
        SELECT pe.id, pe.prenom, pe.nom
        FROM min.personne_enrichie pe
        WHERE pe.is_mediateur = true
          AND pe.coop_id IS NOT NULL
          AND pe.deleted_at IS NULL
          AND pe.aidant_connect_id IS NULL
          AND (pe.nom ILIKE '%' || ${recherche} || '%' OR pe.prenom ILIKE '%' || ${recherche} || '%')
        ORDER BY pe.nom, pe.prenom
        LIMIT 20
      `
    }
    return personnes.map((personne) => ({
      id: personne.id,
      label: [personne.prenom, personne.nom].filter(Boolean).join(' '),
    }))
  }

  async recuperer(scopeFiltre: ScopeFiltre): Promise<ReadonlyArray<MediateurCoopOption>> {
    const personnes = await this.#queryMediateurs(scopeFiltre)
    return personnes.map((personne) => ({
      id: personne.id,
      label: [personne.prenom, personne.nom].filter(Boolean).join(' '),
    }))
  }

  async recupererCoopIds(ids: ReadonlyArray<number>): Promise<ReadonlyArray<string>> {
    if (ids.length === 0) return []
    const rows = await prisma.$queryRaw<ReadonlyArray<{ coop_id: string }>>`
      SELECT pe.coop_id
      FROM min.personne_enrichie pe
      WHERE pe.id = ANY(ARRAY[${Prisma.join([...ids])}]::int[])
        AND pe.coop_id IS NOT NULL
    `
    return rows.map((row) => row.coop_id)
  }

  async recupererCoopIdsParStructure(structureId: number): Promise<ReadonlyArray<string>> {
    const rows = await prisma.$queryRaw<ReadonlyArray<{ coop_id: string }>>`
      SELECT pe.coop_id
      FROM min.personne_enrichie pe
      WHERE (
        pe.structure_employeuse_id = ${structureId}
        OR EXISTS (
          SELECT 1 FROM main.personne_affectations aff
          WHERE aff.personne_id = pe.id
            AND aff.est_active = true
            AND aff.structure_id = ${structureId}
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
      WHERE pe.structure_employeuse_id = ANY(ARRAY[${Prisma.join(ids)}]::int[])
        AND pe.is_mediateur = true
        AND pe.coop_id IS NOT NULL
        AND pe.deleted_at IS NULL
        AND pe.aidant_connect_id IS NULL
    `
    return rows.map((row) => row.coop_id)
  }

  async recupererParIds(ids: ReadonlyArray<number>): Promise<ReadonlyArray<MediateurCoopOption>> {
    if (ids.length === 0) {
      return []
    }
    const personnes = await prisma.$queryRaw<ReadonlyArray<PersonneRow>>`
      SELECT pe.id, pe.prenom, pe.nom
      FROM min.personne_enrichie pe
      WHERE pe.id = ANY(ARRAY[${Prisma.join([...ids])}]::int[])
        AND pe.is_mediateur = true
        AND pe.coop_id IS NOT NULL
        AND pe.deleted_at IS NULL
        AND pe.aidant_connect_id IS NULL
      ORDER BY pe.nom, pe.prenom
    `
    return personnes.map((personne) => ({
      id: personne.id,
      label: [personne.prenom, personne.nom].filter(Boolean).join(' '),
    }))
  }

  async #queryMediateurs(scopeFiltre: ScopeFiltre): Promise<ReadonlyArray<PersonneRow>> {
    if (scopeFiltre.type === 'departemental') {
      return prisma.$queryRaw<ReadonlyArray<PersonneRow>>`
        SELECT DISTINCT pe.id, pe.prenom, pe.nom
        FROM min.personne_enrichie pe
        LEFT JOIN main.structure str ON str.id = pe.structure_employeuse_id
        LEFT JOIN main.adresse ad ON ad.id = str.adresse_id
        WHERE pe.is_mediateur = true
          AND pe.coop_id IS NOT NULL
          AND pe.deleted_at IS NULL
          AND pe.aidant_connect_id IS NULL
          AND ad.departement = ANY(${[...scopeFiltre.codes]})
        ORDER BY pe.nom, pe.prenom
      `
    }

    if (scopeFiltre.type === 'structure') {
      return prisma.$queryRaw<ReadonlyArray<PersonneRow>>`
        SELECT DISTINCT pe.id, pe.prenom, pe.nom
        FROM min.personne_enrichie pe
        WHERE pe.is_mediateur = true
          AND pe.coop_id IS NOT NULL
          AND pe.deleted_at IS NULL
          AND pe.aidant_connect_id IS NULL
          AND (
            pe.structure_employeuse_id = ${scopeFiltre.id}
            OR EXISTS (
              SELECT 1 FROM main.personne_affectations aff
              WHERE aff.personne_id = pe.id
                AND aff.est_active = true
                AND aff.structure_id = ${scopeFiltre.id}
            )
          )
        ORDER BY pe.nom, pe.prenom
      `
    }

    return prisma.$queryRaw<ReadonlyArray<PersonneRow>>`
      SELECT pe.id, pe.prenom, pe.nom
      FROM min.personne_enrichie pe
      WHERE pe.is_mediateur = true
        AND pe.coop_id IS NOT NULL
        AND pe.deleted_at IS NULL
        AND pe.aidant_connect_id IS NULL
      ORDER BY pe.nom, pe.prenom
    `
  }
}

type PersonneRow = Readonly<{
  id: number
  nom: null | string
  prenom: null | string
}>
