import { Prisma } from '@prisma/client'

import { conditionTerritoriale } from './shared/filtreTerritorialSql'
import { reportLoaderError } from './shared/sentryErrorReporter'
import prisma from '../../prisma/prismaClient'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'
import { FiltreTerritorial, libelleFiltreTerritorial } from '@/use-cases/queries/shared/FiltreTerritorial'

export interface StatistiquesMediateursReadModel {
  nombreAidantsConnect: number
  nombreConseillersNumeriques: number
  nombreCoordinateurs: number
  nombreMediateurs: number
}

export class PrismaStatistiquesMediateursLoader implements StatistiquesMediateursLoader {
  async get(filtre: FiltreTerritorial): Promise<ErrorReadModel | StatistiquesMediateursReadModel> {
    try {
      const result =
        filtre.type === 'national'
          ? await this.getStatistiquesNationales()
          : await this.getStatistiquesDuPerimetre(filtre)

      return {
        nombreAidantsConnect: Number(result.aidants_connect),
        nombreConseillersNumeriques: Number(result.conseillers_numeriques),
        nombreCoordinateurs: Number(result.coordinateurs),
        nombreMediateurs: Number(result.mediateurs),
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaStatistiquesMediateursLoader', {
        operation: 'get',
        territoire: libelleFiltreTerritorial(filtre),
      })
      return {
        message: 'Impossible de récupérer les statistiques des médiateurs numériques',
        type: 'error',
      }
    }
  }

  private async getStatistiquesDuPerimetre(filtre: FiltreTerritorial): Promise<StatistiquesQueryResult> {
    const result = await prisma.$queryRaw<Array<StatistiquesQueryResult>>(Prisma.sql`
      SELECT
        COUNT(*) FILTER (WHERE pe.est_actuellement_mediateur_en_poste = true) AS mediateurs,
        COUNT(*) FILTER (WHERE pe.is_coordinateur = true AND pe.est_actuellement_mediateur_en_poste = true) AS coordinateurs,
        COUNT(*) FILTER (WHERE pe.est_actuellement_conseiller_numerique = true) AS conseillers_numeriques,
        COUNT(*) FILTER (WHERE pe.labellisation_aidant_connect = true AND pe.est_actuellement_mediateur_en_poste = true) AS aidants_connect
      FROM min.personne_enrichie pe
      LEFT JOIN main.structure_administrative s ON s.id = pe.structure_employeuse_id
      LEFT JOIN main.adresse a ON a.id = s.adresse_id
      WHERE pe.est_actuellement_mediateur_en_poste = true
      AND ${conditionTerritoriale(filtre, 'a')}
    `)
    return result[0]
  }

  private async getStatistiquesNationales(): Promise<StatistiquesQueryResult> {
    const result = await prisma.$queryRaw<Array<StatistiquesQueryResult>>`
      SELECT
        COUNT(*) FILTER (WHERE pe.est_actuellement_mediateur_en_poste = true) AS mediateurs,
        COUNT(*) FILTER (WHERE pe.is_coordinateur = true AND pe.est_actuellement_mediateur_en_poste = true) AS coordinateurs,
        COUNT(*) FILTER (WHERE pe.est_actuellement_conseiller_numerique = true) AS conseillers_numeriques,
        COUNT(*) FILTER (WHERE pe.labellisation_aidant_connect = true AND pe.est_actuellement_mediateur_en_poste = true) AS aidants_connect
      FROM min.personne_enrichie pe
      WHERE pe.est_actuellement_mediateur_en_poste = true
    `
    return result[0]
  }
}

interface StatistiquesMediateursLoader {
  get(filtre: FiltreTerritorial): Promise<ErrorReadModel | StatistiquesMediateursReadModel>
}

interface StatistiquesQueryResult {
  aidants_connect: bigint
  conseillers_numeriques: bigint
  coordinateurs: bigint
  mediateurs: bigint
}
