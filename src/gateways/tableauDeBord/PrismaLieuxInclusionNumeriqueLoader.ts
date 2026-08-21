import { Prisma } from '@prisma/client'

import prisma from '../../../prisma/prismaClient'
import { conditionTerritoriale } from '../shared/filtreTerritorialSql'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import {
  LieuxInclusionNumeriqueLoader,
  LieuxInclusionNumeriqueReadModel,
} from '@/use-cases/queries/RecupererLieuxInclusionNumerique'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'
import { FiltreTerritorial, libelleFiltreTerritorial } from '@/use-cases/queries/shared/FiltreTerritorial'

export class PrismaLieuxInclusionNumeriqueLoader implements LieuxInclusionNumeriqueLoader {
  async get(filtre: FiltreTerritorial): Promise<ErrorReadModel | LieuxInclusionNumeriqueReadModel> {
    try {
      // le inner join pour garder la cohérence avec les chiffres de la page Lieux Inclusion Numerique
      const result = await prisma.$queryRaw<Array<{ nb_lieux: bigint }>>(Prisma.sql`
        SELECT
          COUNT(*) AS nb_lieux
        FROM main.lieu_inclusion
        INNER JOIN main.adresse ON lieu_inclusion.adresse_id = adresse.id
        WHERE ${conditionTerritoriale(filtre, 'adresse')}
      `)

      return {
        departement: libelleFiltreTerritorial(filtre),
        nombreLieux: Number(result[0]?.nb_lieux ?? 0),
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaLieuxInclusionNumeriqueLoader', {
        operation: 'get',
        territoire: libelleFiltreTerritorial(filtre),
      })
      return {
        message: "Impossible de récupérer les données des lieux d'inclusion numérique",
        type: 'error',
      }
    }
  }
}
