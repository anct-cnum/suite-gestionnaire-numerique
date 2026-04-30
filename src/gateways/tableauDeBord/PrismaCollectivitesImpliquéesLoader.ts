import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { CollectivitesLoader, CollectivitesReadModel } from '@/use-cases/queries/RecupererCollectivitesImpliquees'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaCollectivitesLoader implements CollectivitesLoader {
  readonly #typesCollectivites = new Set([
    'Collectivité, commune',
    'Collectivité, EPCI',
    'Collectivité, intercommunalité',
    'Collectivité territoriale',
    'Commune',
    'Conseil départemental',
    'EPCI',
    'Préfecture départementale',
    'Préfecture régionale',
    'Région',
  ])

  async get(): Promise<CollectivitesReadModel | ErrorReadModel> {
    try {
      const membres = await prisma.membreRecord.findMany({
        where: {
          gouvernanceDepartementCode: {
            not: 'zzz',
          },
        },
      })

      const collectivites = membres.filter((membre) => this.#estCollectivite(membre.type ?? ''))
      const nombreCoporteurs = collectivites.filter((membre) => membre.isCoporteur).length

      const ventilationMap = new Map<string, number>()
      collectivites.forEach((membre) => {
        const categorie = this.#categoriser(membre.type ?? '')
        ventilationMap.set(categorie, (ventilationMap.get(categorie) ?? 0) + 1)
      })

      const ventilationParCategorie = Array.from(ventilationMap.entries())
        .map(([categorie, count]) => ({ categorie, count }))
        .sort((itemA, itemB) => itemB.count - itemA.count)

      return {
        nombreCoporteurs,
        nombreTotal: collectivites.length,
        ventilationParCategorie,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaCollectivitesLoader', {
        operation: 'get',
      })
      return {
        message: 'Erreur lors de la récupération des collectivités impliquées',
        type: 'error' as const,
      }
    }
  }

  #categoriser(type: string): string {
    if (type === 'Conseil départemental') {
      return 'Conseils départementaux'
    }
    if (type === 'Région') {
      return 'Conseils régionaux'
    }
    if (type === 'EPCI' || type === 'Collectivité, EPCI' || type === 'Collectivité, intercommunalité') {
      return 'EPCI'
    }
    if (type === 'Commune' || type === 'Collectivité, commune') {
      return 'Communes'
    }
    return 'Autres'
  }

  #estCollectivite(type: string): boolean {
    return this.#typesCollectivites.has(type)
  }
}
