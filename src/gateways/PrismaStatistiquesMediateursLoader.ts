import { Prisma } from '@prisma/client'

import { reportLoaderError } from './shared/sentryErrorReporter'
import prisma from '../../prisma/prismaClient'
import departements from '../../ressources/departements.json'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export interface StatistiquesMediateursReadModel {
  nombreAidantsConnect: number
  nombreConseillersNumeriques: number
  nombreCoordinateurs: number
  nombreMediateurs: number
}

export class PrismaStatistiquesMediateursLoader implements StatistiquesMediateursLoader {
  async get(
    territoire: string,
    niveau: NiveauTerritoire = 'departement'
  ): Promise<ErrorReadModel | StatistiquesMediateursReadModel> {
    try {
      const result =
        territoire === 'France' || niveau === 'national'
          ? await this.getStatistiquesNationales()
          : await this.getStatistiquesDepartement(this.buildDepartementFilter(territoire, niveau))

      return {
        nombreAidantsConnect: Number(result.aidants_connect),
        nombreConseillersNumeriques: Number(result.conseillers_numeriques),
        nombreCoordinateurs: Number(result.coordinateurs),
        nombreMediateurs: Number(result.mediateurs),
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaStatistiquesMediateursLoader', {
        operation: 'get',
        territoire,
      })
      return {
        message: 'Impossible de récupérer les statistiques des médiateurs numériques',
        type: 'error',
      }
    }
  }

  // Le code de territoire est ambigu : un code département (ex. '01' = Ain) coïncide avec un
  // code région d'outre-mer (ex. '01' = Guadeloupe). On s'appuie sur le niveau explicite plutôt
  // que de deviner, sinon la vitrine d'un département (01 à 06) affiche les chiffres de la région
  // d'outre-mer homonyme.
  private buildDepartementFilter(territoire: string, niveau: NiveauTerritoire): Array<string> {
    if (niveau === 'region') {
      return departements.filter((dept) => dept.regionCode === territoire).map((dept) => dept.code)
    }

    return [territoire]
  }

  private async getStatistiquesDepartement(departementsFilter: Array<string>): Promise<StatistiquesQueryResult> {
    const departementCondition =
      departementsFilter.length > 0 ? Prisma.sql`AND a.departement = ANY(${departementsFilter})` : Prisma.empty

    const result = await prisma.$queryRaw<Array<StatistiquesQueryResult>>`
      SELECT
        COUNT(*) FILTER (WHERE pe.est_actuellement_mediateur_en_poste = true) AS mediateurs,
        COUNT(*) FILTER (WHERE pe.is_coordinateur = true AND pe.est_actuellement_mediateur_en_poste = true) AS coordinateurs,
        COUNT(*) FILTER (WHERE pe.est_actuellement_conseiller_numerique = true) AS conseillers_numeriques,
        COUNT(*) FILTER (WHERE pe.labellisation_aidant_connect = true AND pe.est_actuellement_mediateur_en_poste = true) AS aidants_connect
      FROM min.personne_enrichie pe
      LEFT JOIN main.structure_administrative s ON s.id = pe.structure_employeuse_id
      LEFT JOIN main.adresse a ON a.id = s.adresse_id
      WHERE pe.est_actuellement_mediateur_en_poste = true
      ${departementCondition}
    `
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
  get(territoire: string, niveau?: NiveauTerritoire): Promise<ErrorReadModel | StatistiquesMediateursReadModel>
}

type NiveauTerritoire = 'departement' | 'national' | 'region'

interface StatistiquesQueryResult {
  aidants_connect: bigint
  conseillers_numeriques: bigint
  coordinateurs: bigint
  mediateurs: bigint
}
