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

  async getForFrance(): Promise<ErrorReadModel | DepartementsReadModel> {
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

      const icpMap = new Map(icpDepartements.map((icp) => [icp.code, icp.label]))
      
      const statistiquesicp = {
        securise: 0,
        appuinecessaire: 0,
        atteignable: 0,
        compromis: 0,
        nonenregistres: 0,
      }

      const departementsWithIcp = departements.map((departement) => {
        const label = icpMap.get(departement.code)
        
        switch (label) {
          case 'objectifs sécurisés':
            statistiquesicp.securise++
            break
          case 'appuis nécessaires':
            statistiquesicp.appuinecessaire++
            break
          case 'objectifs atteignables':
            statistiquesicp.atteignable++
            break
          case 'objectifs compromis':
            statistiquesicp.compromis++
            break
          case null:
          case undefined:
            statistiquesicp.nonenregistres++
            break
        }

        return {
          codeDepartement: departement.code,
          ifn: Number(departement.score),
          indiceConfiance: label ?? null,
        }
      })

      return {
        statistiquesicp,
        departements: departementsWithIcp,
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
