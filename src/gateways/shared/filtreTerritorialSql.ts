import { Prisma } from '@prisma/client'

import { FiltreTerritorial } from '@/use-cases/queries/shared/FiltreTerritorial'

// Condition booléenne sur la table adresse (aliasée), composable dans un WHERE existant.
export function conditionTerritoriale(filtre: FiltreTerritorial, aliasAdresse: string): Prisma.Sql {
  const alias = Prisma.raw(aliasAdresse)
  switch (filtre.type) {
    case 'communes':
      return Prisma.sql`${alias}.code_insee = ANY(${[...filtre.codesInsee]})`
    case 'departement':
      return Prisma.sql`${alias}.departement = ${filtre.code}`
    case 'departements':
      return Prisma.sql`${alias}.departement = ANY(${[...filtre.codes]})`
    case 'national':
      return Prisma.sql`TRUE`
  }
}
