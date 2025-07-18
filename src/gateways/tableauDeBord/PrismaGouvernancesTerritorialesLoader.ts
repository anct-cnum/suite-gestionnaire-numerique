import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import {
  GouvernancesTerritorialesLoader,
  GouvernancesTerritorialesReadModel,
} from '@/use-cases/queries/RecuperGouvernancesTerritoriales'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaGouvernancesTerritorialesLoader implements GouvernancesTerritorialesLoader {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async get(): Promise<ErrorReadModel | GouvernancesTerritorialesReadModel> {
    try {
      // Récupérer toutes les gouvernances sauf 'zzz'
      const gouvernances = await prisma.gouvernanceRecord.findMany({
        include: {
          membres: {
            where: {
              isCoporteur: true,
              NOT: {
                type: 'Préfecture départementale',
              },
            },
          },
        },
        where: {
          departementCode: {
            not: 'zzz',
          },
        },
      })

      // Compter les gouvernances sans coporteur (autre que préfecture)
      const gouvernancesSansCoporteur = gouvernances.filter(
        (gouvernance) => gouvernance.membres.length === 0
      ).length

      // Regrouper les membres coporteurs par type
      const coporteursParType = new Map<string, number>()
      
      gouvernances.forEach((gouvernance) => {
        gouvernance.membres.forEach((membre) => {
          // Exclure les préfectures départementales du comptage
          if (membre.type !== 'Préfecture départementale') {
            const type = membre.type ?? 'Autre'
            coporteursParType.set(type, (coporteursParType.get(type) ?? 0) + 1)
          }
        })
      })

      // Convertir en tableau trié par nombre décroissant
      const ventilationParTypeDeCoporteur = Array.from(coporteursParType.entries())
        .map(([type, count]) => ({ count, type }))
        .sort((itemA, itemB) => itemB.count - itemA.count)

      return {
        nombreSansCoporteur: gouvernancesSansCoporteur,
        nombreTotal: 105, // Nombre fixe de départements/gouvernances
        ventilationParTypeDeCoporteur,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaGouvernancesTerritorialesLoader', {
        operation: 'get',
      })
      return {
        message: 'Erreur lors de la récupération des gouvernances territoriales',
        type: 'error' as const,
      }
    }
  }
}