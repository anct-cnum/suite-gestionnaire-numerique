import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { CommuneReadModel, DepartementReadModel, IndicesDeFragiliteLoader } from '@/use-cases/queries/RecupererMesIndicesDeFragilite'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaIndicesDeFragiliteLoader implements IndicesDeFragiliteLoader {
  async getForDepartement(codeDepartement: string): Promise<ErrorReadModel | ReadonlyArray<CommuneReadModel>> {
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

      return communes.map((commune) => ({
        codeInsee: commune.codeInsee,
        score: Number(commune.score),
      }))
    } catch (error) {
      reportLoaderError(error, 'PrismaIndicesDeFragiliteLoader', {
        codeDepartement,
        operation: 'getForDepartement',
      })
      return {
        message: 'Impossible de récupérer les données des indices de fragilité',
        type: 'error',
      }
    }
  }

  async getForFrance(): Promise<ErrorReadModel | ReadonlyArray<DepartementReadModel>> {
    try {
      const departements = await prisma.ifn_departement.findMany({
        select: {
          code: true,
          score: true,
        },
      })

      return departements.map((departement) => ({
        codeDepartement: departement.code,
        score: Number(departement.score),
      }))
    } catch (error) {
      reportLoaderError(error, 'PrismaIndicesDeFragiliteLoader', {
        operation: 'getForFrance',
      })
      return {
        message: 'Impossible de récupérer les données des indices de fragilité',
        type: 'error',
      }
    }
  }
}
