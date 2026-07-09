import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { capitaliserMots } from '@/shared/lang'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

export type LieuCoopOption = Readonly<{
  label: string
  value: string
}>

// Refonte 2026 : "lieux coop" = main.lieu_inclusion (et plus main.structure
// legacy). activites_coop a ete repointe sur lieu_id (V084 dataspace).
// Pour le scope "structure", scopeFiltre.id refere a une SA.id : on selectionne
// les lieux associes via la table d'asso main.lieu_inclusion_structure_administrative.
export class PrismaLieuxCoopLoader {
  async rechercher(recherche: string, scopeFiltre: ScopeFiltre): Promise<ReadonlyArray<LieuCoopOption>> {
    let rows: ReadonlyArray<LieuRow>
    if (scopeFiltre.type === 'structure') {
      rows = await prisma.$queryRaw<ReadonlyArray<LieuRow>>`
        SELECT DISTINCT l.id, l.nom, ad.code_postal, ad.nom_commune
        FROM main.lieu_inclusion l
        JOIN main.activites_coop a ON a.lieu_id = l.id
        LEFT JOIN main.adresse ad ON ad.id = l.adresse_id
        WHERE EXISTS (
            SELECT 1 FROM main.lieu_inclusion_structure_administrative asso
            WHERE asso.lieu_id = l.id AND asso.structure_administrative_id = ${scopeFiltre.id}
          )
          AND l.nom IS NOT NULL
          AND l.nom ILIKE '%' || ${recherche} || '%'
        ORDER BY l.nom
        LIMIT 20
      `
    } else if (scopeFiltre.type === 'departemental') {
      rows = await prisma.$queryRaw<ReadonlyArray<LieuRow>>`
        SELECT DISTINCT l.id, l.nom, ad.code_postal, ad.nom_commune
        FROM main.lieu_inclusion l
        JOIN main.activites_coop a ON a.lieu_id = l.id
        LEFT JOIN main.adresse ad ON ad.id = l.adresse_id
        WHERE l.nom IS NOT NULL
          AND l.nom ILIKE '%' || ${recherche} || '%'
          AND ad.departement = ANY(${[...scopeFiltre.codes]})
        ORDER BY l.nom
        LIMIT 20
      `
    } else {
      rows = await prisma.$queryRaw<ReadonlyArray<LieuRow>>`
        SELECT DISTINCT l.id, l.nom, ad.code_postal, ad.nom_commune
        FROM main.lieu_inclusion l
        JOIN main.activites_coop a ON a.lieu_id = l.id
        LEFT JOIN main.adresse ad ON ad.id = l.adresse_id
        WHERE l.nom IS NOT NULL
          AND l.nom ILIKE '%' || ${recherche} || '%'
        ORDER BY l.nom
        LIMIT 20
      `
    }
    return rows.map(versOption)
  }

  async recupererCoopIds(ids: ReadonlyArray<string>): Promise<ReadonlyArray<string>> {
    if (ids.length === 0) return []
    const rows = await prisma.$queryRaw<ReadonlyArray<{ structure_coop_id: string }>>`
      SELECT l.structure_coop_id
      FROM main.lieu_inclusion l
      WHERE l.id = ANY(ARRAY[${Prisma.join(ids.map(Number))}]::int[])
        AND l.structure_coop_id IS NOT NULL
    `
    return rows.map((row) => row.structure_coop_id)
  }

  async recupererParIds(ids: ReadonlyArray<string>): Promise<ReadonlyArray<LieuCoopOption>> {
    if (ids.length === 0) {
      return []
    }
    const rows = await prisma.$queryRaw<ReadonlyArray<LieuRow>>`
      SELECT l.id, l.nom, ad.code_postal, ad.nom_commune
      FROM main.lieu_inclusion l
      LEFT JOIN main.adresse ad ON ad.id = l.adresse_id
      WHERE l.id = ANY(ARRAY[${Prisma.join(ids.map(Number))}]::int[])
        AND l.nom IS NOT NULL
      ORDER BY l.nom
    `
    return rows.map(versOption)
  }
}

function versOption(row: LieuRow): LieuCoopOption {
  const localisation =
    row.code_postal !== null && row.nom_commune !== null
      ? ` · ${row.code_postal} - ${capitaliserMots(row.nom_commune)}`
      : ''
  return { label: `${row.nom}${localisation}`, value: String(row.id) }
}

type LieuRow = Readonly<{
  code_postal: null | string
  id: number
  nom: string
  nom_commune: null | string
}>
