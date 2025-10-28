import { Prisma } from '@prisma/client'

import departements from '../../ressources/departements.json'

export function buildWhereClause(
  baseConditions: Array<Prisma.Sql>,
  standardFilters: StandardFilters = {},
  zonageFilters: ZonageFilters = {}
): Prisma.Sql {
  const conditions = [...baseConditions]

  // Filtres standards
  if (standardFilters.codeDepartement !== undefined && standardFilters.codeDepartement !== '') {
    conditions.push(Prisma.sql`a.departement = ${standardFilters.codeDepartement}`)
  }

  if (standardFilters.codeRegion !== undefined && standardFilters.codeRegion !== '') {
    const departementsRegion = getDepartementsParRegion(standardFilters.codeRegion)
    if (departementsRegion.length > 0) {
      conditions.push(Prisma.sql`a.departement IN (${Prisma.join(departementsRegion)})`)
    }
  }

  if (standardFilters.typeStructure !== undefined && standardFilters.typeStructure !== '') {
    conditions.push(Prisma.sql`LEFT(s.categorie_juridique, 2) = ${standardFilters.typeStructure}`)
  }

  // Filtres de zonage
  if (zonageFilters.qpv === true) {
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM admin.zonage z
      WHERE z.type = 'QPV' AND public.st_contains(z.geom, a.geom)
    )`)
  }

  if (zonageFilters.frr === true) {
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM admin.zonage z
      WHERE z.type = 'FRR' AND z.code_insee = a.code_insee
    )`)
  }

  if (zonageFilters.horsZonePrioritaire === true) {
    conditions.push(Prisma.sql`NOT EXISTS (
      SELECT 1 FROM admin.zonage z
      WHERE (z.type = 'QPV' AND public.st_contains(z.geom, a.geom))
         OR (z.type = 'FRR' AND z.code_insee = a.code_insee)
    )`)
  }

  return conditions.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
    : Prisma.empty
}

// Crée un mapping de code région -> liste de codes départements
function getDepartementsParRegion(codeRegion: string): Array<string> {
  return departements
    .filter(dept => dept.regionCode === codeRegion)
    .map(dept => dept.code)
}

interface ZonageFilters {
  frr?: boolean
  horsZonePrioritaire?: boolean
  qpv?: boolean
}

interface StandardFilters {
  codeDepartement?: string
  codeRegion?: string
  typeStructure?: string
}
