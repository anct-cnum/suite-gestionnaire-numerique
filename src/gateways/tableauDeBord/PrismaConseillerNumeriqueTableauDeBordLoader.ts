import { Prisma } from '@prisma/client'

import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import {
  ConseillerNumeriqueTableauDeBordLoader,
  ConseillerNumeriqueTableauDeBordReadModel,
} from '@/use-cases/queries/RecupererConseillerNumeriqueTableauDeBord'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaConseillerNumeriqueTableauDeBordLoader implements ConseillerNumeriqueTableauDeBordLoader {
  readonly #enveloppeDao = prisma.enveloppeFinancementRecord

  async get(territoire: string): Promise<ConseillerNumeriqueTableauDeBordReadModel | ErrorReadModel> {
    try {
      const cnEnveloppes = await this.#enveloppeDao.findMany({
        orderBy: { dateDeDebut: 'asc' },
        where: { libelle: { startsWith: 'Conseiller Numérique' } },
      })

      if (cnEnveloppes.length === 0) {
        return { enveloppes: [] }
      }

      const territoireFilter = territoire === 'France'
        ? Prisma.empty
        : Prisma.sql`AND a.departement = ${territoire}`

      const result = await prisma.$queryRaw<Array<QueryResult>>`
        SELECT
          COALESCE(SUM(v.subvention_v1) FILTER (WHERE v.subvention_v1 > 0), 0) AS credits_v1,
          COALESCE(SUM(v.subvention_v2 + v.bonification_v2) FILTER (WHERE v.subvention_v2 > 0 OR v.bonification_v2 > 0), 0) AS credits_v2,
          COUNT(DISTINCT v.structure_id) FILTER (WHERE v.subvention_v1 > 0) AS beneficiaires_v1,
          COUNT(DISTINCT v.structure_id) FILTER (WHERE v.subvention_v2 > 0 OR v.bonification_v2 > 0) AS beneficiaires_v2
        FROM min.postes_conseiller_numerique_synthese v
        LEFT JOIN main.structure st ON st.id = v.structure_id
        LEFT JOIN main.adresse a ON a.id = st.adresse_id
        WHERE 1=1 ${territoireFilter}
      `

      const data = result[0]
      const enveloppes: Array<{
        beneficiaires: number
        creditsEngages: number
        enveloppeTotale: number
        label: string
      }> = []

      // V1 = première enveloppe CN (la plus ancienne par dateDeDebut)
      if (Number(data.credits_v1) > 0 || Number(data.beneficiaires_v1) > 0) {
        enveloppes.push({
          beneficiaires: Number(data.beneficiaires_v1),
          creditsEngages: Number(data.credits_v1),
          enveloppeTotale: cnEnveloppes[0].montant,
          label: cnEnveloppes[0].libelle,
        })
      }

      // V2 = deuxième enveloppe CN
      if (cnEnveloppes.length > 1 && (Number(data.credits_v2) > 0 || Number(data.beneficiaires_v2) > 0)) {
        enveloppes.push({
          beneficiaires: Number(data.beneficiaires_v2),
          creditsEngages: Number(data.credits_v2),
          enveloppeTotale: cnEnveloppes[1].montant,
          label: cnEnveloppes[1].libelle,
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
  credits_v1: bigint
  credits_v2: bigint
}
