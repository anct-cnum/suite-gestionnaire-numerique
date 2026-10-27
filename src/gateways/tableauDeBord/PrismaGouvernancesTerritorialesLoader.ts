import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { chargerMembresConfirmes } from '../shared/structuresMembresConfirmes'
import { classerParCategorieJuridique } from '@/shared/categorieJuridique'
import {
  GouvernancesTerritorialesLoader,
  GouvernancesTerritorialesReadModel,
} from '@/use-cases/queries/RecuperGouvernancesTerritoriales'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaGouvernancesTerritorialesLoader implements GouvernancesTerritorialesLoader {
  async get(): Promise<ErrorReadModel | GouvernancesTerritorialesReadModel> {
    try {
      const [gouvernances, membres] = await Promise.all([
        prisma.gouvernanceRecord.findMany({ select: { departementCode: true } }),
        chargerMembresConfirmes(),
      ])

      // Gouvernances ayant au moins un coporteur par libellé de catégorie,
      // les services de l'État (préfectures, SGAR…) n'étant pas comptés comme coporteurs
      const gouvernancesParType = new Map<string, Set<string>>()
      membres
        .filter((membre) => membre.isCoporteur)
        .forEach((membre) => {
          const classement = classerParCategorieJuridique(membre.codeCategorieJuridique)
          if (classement.famille === 'etat') {
            return
          }
          const gouvernancesDuType = gouvernancesParType.get(classement.libelle) ?? new Set<string>()
          gouvernancesParType.set(classement.libelle, gouvernancesDuType.add(membre.gouvernance))
        })

      const gouvernancesAvecCoporteur = new Set(
        Array.from(gouvernancesParType.values()).flatMap((gouvernancesDuType) => Array.from(gouvernancesDuType))
      )

      return {
        nombreSansCoporteur: gouvernances.filter(
          ({ departementCode }) => !gouvernancesAvecCoporteur.has(departementCode)
        ).length,
        nombreTotal: gouvernances.length,
        ventilationParTypeDeCoporteur: Array.from(gouvernancesParType.entries())
          .map(([type, gouvernancesDuType]) => ({ count: gouvernancesDuType.size, type }))
          .toSorted((itemA, itemB) => itemB.count - itemA.count || itemA.type.localeCompare(itemB.type)),
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
