import { Prisma } from '@prisma/client'

import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import {
  ConseillerNumeriqueTableauDeBordLoader,
  ConseillerNumeriqueTableauDeBordReadModel,
} from '@/use-cases/queries/RecupererConseillerNumeriqueTableauDeBord'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaConseillerNumeriqueTableauDeBordLoader implements ConseillerNumeriqueTableauDeBordLoader {
  async get(territoire: string): Promise<ConseillerNumeriqueTableauDeBordReadModel | ErrorReadModel> {
    try {
      const territoireFilter = territoire === 'France'
        ? Prisma.empty
        : Prisma.sql`AND a.departement = ${territoire}`

      const result = await prisma.$queryRaw<Array<QueryResult>>`
        SELECT
          COALESCE(SUM(v.subvention_v1) FILTER (WHERE v.subvention_v1 > 0), 0) AS total_v1,
          COALESCE(SUM(v.subvention_v2 + v.bonification_v2) FILTER (WHERE v.subvention_v2 > 0 OR v.bonification_v2 > 0), 0) AS total_v2,
          COUNT(DISTINCT v.structure_id) FILTER (WHERE v.subvention_v1 > 0) AS beneficiaires_v1,
          COUNT(DISTINCT v.structure_id) FILTER (WHERE v.subvention_v2 > 0 OR v.bonification_v2 > 0) AS beneficiaires_v2
        FROM min.postes_conseiller_numerique_synthese v
        LEFT JOIN main.structure st ON st.id = v.structure_id
        LEFT JOIN main.adresse a ON a.id = st.adresse_id
        WHERE 1=1 ${territoireFilter}
      `

      const data = result[0]
      const enveloppes: Array<{ beneficiaires: number; label: string; total: number }> = []

      if (Number(data.total_v1) > 0 || Number(data.beneficiaires_v1) > 0) {
        enveloppes.push({
          beneficiaires: Number(data.beneficiaires_v1),
          label: 'Conseiller Numérique - Plan France Relance - État',
          total: Number(data.total_v1),
        })
      }

      if (Number(data.total_v2) > 0 || Number(data.beneficiaires_v2) > 0) {
        enveloppes.push({
          beneficiaires: Number(data.beneficiaires_v2),
          label: 'Conseiller Numérique - 2021 - État',
          total: Number(data.total_v2),
        })
      }

      return { enveloppes }
    } catch (error) {
      reportLoaderError(error, 'PrismaConseillerNumeriqueTableauDeBordLoader', {
        operation: 'get',
        territoire,
      })
      return {
        message: 'Impossible de récupérer les données Conseiller numérique',
        type: 'error',
      }
    }
  }
}

interface QueryResult {
  beneficiaires_v1: bigint
  beneficiaires_v2: bigint
  total_v1: bigint
  total_v2: bigint
}
