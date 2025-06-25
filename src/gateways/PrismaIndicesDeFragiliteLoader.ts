import { reportLoaderError } from './shared/sentryErrorReporter'
import prisma from '../../prisma/prismaClient'
import { IndicesDeFragiliteLoader, IndicesDeFragiliteReadModel } from '@/use-cases/queries/RecupererMesIndicesDeFragilite'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaIndicesDeFragiliteLoader implements IndicesDeFragiliteLoader {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async get(codeDepartement: string): Promise<ErrorReadModel | IndicesDeFragiliteReadModel> {
    try {
      const communes = await prisma.ifnCommune.findMany({
        select: {
          codeInsee: true,
          score: true,
        },
        where: {
          codeInsee: {
            startsWith: codeDepartement,
          },
        },
      })
      return {
        communes: communes.map((commune) => ({
          codeInsee: commune.codeInsee,
          score: commune.score ? Number(commune.score) : null,
        })),
        departement: codeDepartement,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaIndicesDeFragiliteLoader', {
        codeDepartement,
        operation: 'get',
      })
      return {
        message: 'Impossible de récupérer les données des indices de fragilité',
        type: 'error',
      }
    }
  }
}
