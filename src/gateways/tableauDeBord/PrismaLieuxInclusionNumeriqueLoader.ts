import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { LieuxInclusionNumeriqueLoader, LieuxInclusionNumeriqueReadModel } from '@/use-cases/queries/RecupererLieuxInclusionNumerique'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaLieuxInclusionNumeriqueLoader implements LieuxInclusionNumeriqueLoader {
  async get(territoire: string): Promise<ErrorReadModel | LieuxInclusionNumeriqueReadModel> {
    try {
      let result: Array<{ nb_lieux: bigint }>

      if (territoire === 'France') {
        // le inner join pour garder la cohérence avec les chiffres de la page Lieux Inclusion Numerique
        result = await prisma.$queryRaw<Array<{ nb_lieux: bigint }>>`
          SELECT
            COUNT(*) AS nb_lieux
          FROM main.structure
          INNER JOIN main.adresse ON structure.adresse_id = adresse.id
          WHERE structure_cartographie_nationale_id IS NOT NULL
        `
      } else {
        result = await prisma.$queryRaw<Array<{ nb_lieux: bigint }>>`
          SELECT
            COUNT(*) AS nb_lieux
          FROM main.structure
          INNER JOIN main.adresse ON structure.adresse_id = adresse.id
          WHERE structure_cartographie_nationale_id IS NOT NULL AND adresse.departement = ${territoire}
        `
      }

      return {
        departement: territoire,
        nombreLieux: Number(result[0]?.nb_lieux ?? 0),
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaLieuxInclusionNumeriqueLoader', {
        operation: 'get',
        territoire,
      })
      return {
        message: 'Impossible de récupérer les données des lieux d\'inclusion numérique',
        type: 'error',
      }
    }
  }
}
