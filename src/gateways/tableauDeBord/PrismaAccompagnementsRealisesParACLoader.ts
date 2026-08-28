import { Prisma } from '../../../prisma/generated/client'
import prisma from '../../../prisma/prismaClient'
import { conditionTerritoriale } from '../shared/filtreTerritorialSql'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import {
  AccompagnementsRealisesParACLoader,
  AccompagnementsRealisesParACReadModel,
} from '@/use-cases/queries/RecupererAccompagnementsRealises'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'
import { FiltreTerritorial, libelleFiltreTerritorial } from '@/use-cases/queries/shared/FiltreTerritorial'

export class PrismaAccompagnementsRealisesParACLoader implements AccompagnementsRealisesParACLoader {
  async get(filtre: FiltreTerritorial): Promise<AccompagnementsRealisesParACReadModel | ErrorReadModel> {
    try {
      // Récupération du total des accompagnements AC uniquement
      let totalResult: Array<{ total_accompagnements: bigint }>

      if (filtre.type === 'national') {
        totalResult = await prisma.$queryRaw<Array<{ total_accompagnements: bigint }>>`
          SELECT COALESCE(SUM(pe.nb_accompagnements_ac), 0) AS total_accompagnements
          FROM min.personne_enrichie pe
          WHERE pe.type_accompagnateur = 'aidant_numerique'
        `
      } else {
        totalResult = await prisma.$queryRaw<Array<{ total_accompagnements: bigint }>>(Prisma.sql`
          SELECT COALESCE(SUM(pe.nb_accompagnements_ac), 0) AS total_accompagnements
          FROM min.personne_enrichie pe
          LEFT JOIN main.structure_administrative s ON s.id = pe.structure_employeuse_id
          LEFT JOIN main.adresse a ON a.id = s.adresse_id
          WHERE pe.type_accompagnateur = 'aidant_numerique'
            AND ${conditionTerritoriale(filtre, 'a')}
        `)
      }

      const nombreTotalAC = Number(totalResult[0]?.total_accompagnements ?? 0)

      return {
        departement: libelleFiltreTerritorial(filtre),
        nombreTotalAC,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaAccompagnementsRealisesParACLoader', {
        operation: 'get',
        territoire: libelleFiltreTerritorial(filtre),
      })
      return {
        message: 'Impossible de récupérer les données des accompagnements AC',
        type: 'error',
      }
    }
  }
}
