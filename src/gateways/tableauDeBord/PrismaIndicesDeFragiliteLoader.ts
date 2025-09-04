import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { CommuneReadModel, DepartementsReadModel, IndicesLoader } from '@/use-cases/queries/RecupererMesIndicesDeFragilite'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaIndicesDeFragiliteLoader implements IndicesLoader {
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
        ifn: Number(commune.score),
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

  async getForFrance(): Promise<DepartementsReadModel | ErrorReadModel> {
    try {
      const [departements, icpDepartements] = await Promise.all([
        prisma.ifn_departement.findMany({
          select: {
            code: true,
            score: true,
          },
        }),
        prisma.icp_departement.findMany({
          select: {
            code: true,
            label: true,
          },
        }),
      ])

      const icpMap = new Map(
        icpDepartements.map((icp: { code: string; label: null | string }) => [icp.code, icp.label])
      )
      
      const statistiquesicp = {
        appuinecessaire: 0,
        atteignable: 0,
        compromis: 0,
        nonenregistres: 0,
        securise: 0,
      }

      const departementsWithIcp = departements.map((departement) => {
        const label = icpMap.get(departement.code)
        
        switch (label) {
          case 'appuis nécessaires':
            statistiquesicp.appuinecessaire += 1
            break
          case 'objectifs atteignables':
            statistiquesicp.atteignable += 1
            break
          case 'objectifs compromis':
            statistiquesicp.compromis += 1
            break
          case 'objectifs sécurisés':
            statistiquesicp.securise += 1
            break
          case null:
          case undefined:
          default:
            statistiquesicp.nonenregistres += 1
            break
        }

        return {
          codeDepartement: departement.code,
          ifn: Number(departement.score),
          indiceConfiance: label ?? null,
        }
      })

      return {
        departements: departementsWithIcp,
        statistiquesicp,
      }
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
