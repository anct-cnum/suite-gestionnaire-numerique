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

      // Compter les gouvernances par type de coporteur
      const gouvernancesParType = new Map<string, Set<string>>()
      
      gouvernances.forEach((gouvernance) => {
        // Collecter tous les types de coporteurs uniques pour cette gouvernance
        const typesDeCetteGouvernance = new Set<string>()
        
        gouvernance.membres.forEach((membre) => {
          // Exclure les préfectures départementales du comptage
          if (membre.type !== 'Préfecture départementale') {
            const type = membre.type ?? 'Autre'
            typesDeCetteGouvernance.add(type)
          }
        })
        
        // Pour chaque type trouvé dans cette gouvernance, l'ajouter au comptage
        typesDeCetteGouvernance.forEach((type) => {
          if (!gouvernancesParType.has(type)) {
            gouvernancesParType.set(type, new Set())
          }
          const gouvernancesSet = gouvernancesParType.get(type)
          if (gouvernancesSet) {
            gouvernancesSet.add(gouvernance.departementCode)
          }
        })
      })

      // Convertir en tableau avec le nombre de gouvernances par type, trié par nombre décroissant
      const ventilationParTypeDeCoporteur = Array.from(gouvernancesParType.entries())
        .map(([type, gouvernancesSet]) => ({ count: gouvernancesSet.size, type }))
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