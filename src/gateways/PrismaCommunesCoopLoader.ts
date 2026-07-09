import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { alphaAsc, capitaliserMots } from '@/shared/lang'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

export type CommuneOption = Readonly<{
  label: string
  value: string
}>

export class PrismaCommunesCoopLoader {
  async rechercher(recherche: string, scopeFiltre: ScopeFiltre): Promise<ReadonlyArray<CommuneOption>> {
    let rows: ReadonlyArray<CommuneRow>
    if (scopeFiltre.type === 'structure') {
      rows = await prisma.$queryRaw<ReadonlyArray<CommuneRow>>`
        SELECT DISTINCT ON (a.lieu_code_insee) a.lieu_code_insee AS code_insee, ad.nom_commune, ad.code_postal
        FROM main.activites_coop a
        LEFT JOIN main.adresse ad ON ad.code_insee = a.lieu_code_insee
        WHERE a.lieu_code_insee IS NOT NULL
          AND ad.nom_commune IS NOT NULL
          AND a.structure_id = ${scopeFiltre.id}
          AND ad.nom_commune ILIKE '%' || ${recherche} || '%'
        ORDER BY a.lieu_code_insee, ad.nom_commune, ad.code_postal
        LIMIT 20
      `
    } else if (scopeFiltre.type === 'departemental') {
      rows = await prisma.$queryRaw<ReadonlyArray<CommuneRow>>`
        SELECT DISTINCT ON (a.lieu_code_insee) a.lieu_code_insee AS code_insee, ad.nom_commune, ad.code_postal
        FROM main.activites_coop a
        LEFT JOIN main.adresse ad ON ad.code_insee = a.lieu_code_insee
        WHERE a.lieu_code_insee IS NOT NULL
          AND ad.nom_commune IS NOT NULL
          AND ad.nom_commune ILIKE '%' || ${recherche} || '%'
          AND (
            CASE
              WHEN a.lieu_code_insee ~ '^97|^98' THEN LEFT(a.lieu_code_insee, 3)
              ELSE LEFT(a.lieu_code_insee, 2)
            END
          ) = ANY(${[...scopeFiltre.codes]})
        ORDER BY a.lieu_code_insee, ad.nom_commune, ad.code_postal
        LIMIT 20
      `
    } else {
      rows = await prisma.$queryRaw<ReadonlyArray<CommuneRow>>`
        SELECT DISTINCT ON (a.lieu_code_insee) a.lieu_code_insee AS code_insee, ad.nom_commune, ad.code_postal
        FROM main.activites_coop a
        LEFT JOIN main.adresse ad ON ad.code_insee = a.lieu_code_insee
        WHERE a.lieu_code_insee IS NOT NULL
          AND ad.nom_commune IS NOT NULL
          AND ad.nom_commune ILIKE '%' || ${recherche} || '%'
        ORDER BY a.lieu_code_insee, ad.nom_commune, ad.code_postal
        LIMIT 20
      `
    }
    return rows.map(versOption).sort(alphaAsc('label'))
  }

  async recupererParCodes(codes: ReadonlyArray<string>): Promise<ReadonlyArray<CommuneOption>> {
    if (codes.length === 0) {
      return []
    }
    const rows = await prisma.$queryRaw<ReadonlyArray<CommuneRow>>`
      SELECT DISTINCT ON (a.lieu_code_insee) a.lieu_code_insee AS code_insee, ad.nom_commune, ad.code_postal
      FROM main.activites_coop a
      LEFT JOIN main.adresse ad ON ad.code_insee = a.lieu_code_insee
      WHERE a.lieu_code_insee = ANY(ARRAY[${Prisma.join([...codes])}])
        AND ad.nom_commune IS NOT NULL
      ORDER BY a.lieu_code_insee, ad.nom_commune, ad.code_postal
    `
    return rows.map(versOption).sort(alphaAsc('label'))
  }
}

function versOption(row: CommuneRow): CommuneOption {
  return { label: `${row.code_postal} - ${capitaliserMots(row.nom_commune)}`, value: row.code_insee }
}

type CommuneRow = Readonly<{
  code_insee: string
  code_postal: string
  nom_commune: string
}>
