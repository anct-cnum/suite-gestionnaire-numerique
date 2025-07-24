import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { LieuxInclusionNumeriqueLoader, LieuxInclusionNumeriqueReadModel } from '@/use-cases/queries/RecupererLieuxInclusionNumerique'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaLieuxInclusionNumeriqueLoader implements LieuxInclusionNumeriqueLoader {
  async get(territoire: string): Promise<ErrorReadModel | LieuxInclusionNumeriqueReadModel> {
    try {
      let result: Array<{ nb_lieux: bigint }>

      if (territoire === 'France') {
        result = await prisma.$queryRaw<Array<{ nb_lieux: bigint }>>`
          SELECT COUNT(*) AS nb_lieux
          FROM main.personne_lieux_activites pla
          JOIN main.structure s ON pla.structure_id = s.id
          JOIN main.adresse a ON s.adresse_id = a.id
          WHERE a.departement != 'zzz'
        `
      } else {
        result = await prisma.$queryRaw<Array<{ nb_lieux: bigint }>>`
          SELECT COUNT(*) AS nb_lieux
          FROM main.personne_lieux_activites pla
          JOIN main.structure s ON pla.structure_id = s.id
          JOIN main.adresse a ON s.adresse_id = a.id
          WHERE a.departement = ${territoire}
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
