import { Prisma } from '../../prisma/generated/client'
import prisma from '../../prisma/prismaClient'
import {
  PerimetreRechercheTerritoires,
  RechercheTerritoiresLoader,
  TerritoiresTrouvesReadModel,
  TypeTerritoire,
} from '@/use-cases/queries/RechercherTerritoires'

export class PrismaRechercheTerritoiresLoader implements RechercheTerritoiresLoader {
  async rechercher(
    terme: string,
    limite: number,
    perimetre: PerimetreRechercheTerritoires
  ): Promise<TerritoiresTrouvesReadModel> {
    const rows = await prisma.$queryRaw<ReadonlyArray<TerritoireRow>>`
      WITH resultats AS (
        ${brancheRegions(terme, perimetre)}
        SELECT code, nom, code AS numero_departement, 'departement' AS type, 2 AS priorite
        FROM admin.departement
        WHERE (public.unaccent(nom) ILIKE '%' || public.unaccent(${terme}) || '%'
          OR code ILIKE ${terme} || '%')
          ${filtreDepartements(perimetre, Prisma.sql`code`)}
        UNION ALL
        SELECT epci.code, epci.nom, departement.code AS numero_departement, 'epci' AS type, 3 AS priorite
        FROM admin.epci
        ${jointureDepartementDesEpci(perimetre)}
        WHERE (public.unaccent(epci.nom) ILIKE '%' || public.unaccent(${terme}) || '%'
          OR epci.code ILIKE ${terme} || '%')
          ${filtreDepartements(perimetre, Prisma.sql`departement.code`)}
      )
      SELECT code, nom, numero_departement, type, (SELECT COUNT(*) FROM resultats)::int AS total
      FROM resultats
      ORDER BY priorite, nom
      LIMIT ${limite}
    `
    return {
      territoires: rows.map((row) => ({
        code: row.code,
        nom: row.nom,
        numeroDepartement: row.numero_departement,
        type: row.type,
      })),
      total: rows[0]?.total ?? 0,
    }
  }
}

function brancheRegions(terme: string, perimetre: PerimetreRechercheTerritoires): Prisma.Sql {
  if (perimetre.type === 'departements') {
    return Prisma.empty
  }
  return Prisma.sql`
    SELECT code, nom, NULL AS numero_departement, 'region' AS type, 1 AS priorite
    FROM admin.region
    WHERE public.unaccent(nom) ILIKE '%' || public.unaccent(${terme}) || '%'
      OR code ILIKE ${terme} || '%'
    UNION ALL
  `
}

function filtreDepartements(perimetre: PerimetreRechercheTerritoires, colonne: Prisma.Sql): Prisma.Sql {
  if (perimetre.type === 'complet') {
    return Prisma.empty
  }
  return Prisma.sql`AND ${colonne} = ANY(${[...perimetre.codesDepartement]})`
}

// En mode périmétré, la jointure interne exclut les EPCI sans département de rattachement (departement_id null).
function jointureDepartementDesEpci(perimetre: PerimetreRechercheTerritoires): Prisma.Sql {
  if (perimetre.type === 'departements') {
    return Prisma.sql`INNER JOIN admin.departement ON departement.id = epci.departement_id`
  }
  return Prisma.sql`LEFT JOIN admin.departement ON departement.id = epci.departement_id`
}

type TerritoireRow = Readonly<{
  code: string
  nom: string
  numero_departement: null | string
  total: number
  type: TypeTerritoire
}>
