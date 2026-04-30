import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import {
  AutresStructuresLoader,
  AutresStructuresReadModel,
} from '@/use-cases/queries/RecupererAutresStructuresImpliquees'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaAutresStructuresLoader implements AutresStructuresLoader {
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

  async get(): Promise<AutresStructuresReadModel | ErrorReadModel> {
    try {
      const membres = await prisma.membreRecord.findMany({
        where: {
          gouvernanceDepartementCode: {
            not: 'zzz',
          },
        },
      })

      const autresStructures = membres.filter((membre) => membre.type !== null && !this.#estCollectivite(membre.type))
      const nombreCoporteurs = autresStructures.filter((membre) => membre.isCoporteur).length

      const ventilationMap = new Map<string, number>()
      autresStructures.forEach((membre) => {
        const categorie = this.#categoriser(membre.type ?? '')
        ventilationMap.set(categorie, (ventilationMap.get(categorie) ?? 0) + 1)
      })

      const ventilationParCategorie = Array.from(ventilationMap.entries())
        .map(([categorie, count]) => ({ categorie, count }))
        .sort((itemA, itemB) => itemB.count - itemA.count)

      return {
        nombreCoporteurs,
        nombreTotal: autresStructures.length,
        ventilationParCategorie,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaAutresStructuresLoader', {
        operation: 'get',
      })
      return {
        message: 'Erreur lors de la récupération des autres structures impliquées',
        type: 'error' as const,
      }
    }
  }

  #categoriser(type: string): string {
    if (type === 'Association' || type === 'Structure associative') {
      return 'Associations'
    }
    if (type === 'Entreprise privée' || type === 'Opérateur' || type === 'Partenaire privé') {
      return 'Entreprises privées'
    }
    if (type.includes('Syndicat')) {
      return 'Syndicats mixtes'
    }
    if (type === 'GIE') {
      return 'GIE'
    }
    return 'Autres'
  }

  #estCollectivite(type: string): boolean {
    return this.#typesCollectivites.has(type)
  }
}
