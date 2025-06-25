import { reportLoaderError } from './shared/sentryErrorReporter'
import prisma from '../../prisma/prismaClient'
import { LieuxInclusionNumeriqueLoader, LieuxInclusionNumeriqueReadModel } from '@/use-cases/queries/RecupererLieuxInclusionNumerique'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaLieuxInclusionNumeriqueLoader implements LieuxInclusionNumeriqueLoader {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async get(codeDepartement: string): Promise<ErrorReadModel | LieuxInclusionNumeriqueReadModel> {
    try {
      const result = await prisma.$queryRaw<Array<{ nb_lieux: bigint }>>`
        SELECT COUNT(*) AS nb_lieux
        FROM main.personne_lieux_activites pla
        JOIN main.structure s ON pla.structure_id = s.id
        JOIN main.adresse a ON s.adresse_id = a.id
        WHERE a.departement = ${codeDepartement}
      `

      return {
        departement: codeDepartement,
        nombreLieux: Number(result[0]?.nb_lieux ?? 0),
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaLieuxInclusionNumeriqueLoader', {
        codeDepartement,
        operation: 'get',
      })
      return {
        message: 'Impossible de récupérer les données des lieux d\'inclusion numérique',
        type: 'error',
      }
    }
  }
} 