import prisma from '../../../prisma/prismaClient'
import { buildLieuxDansScopeCte } from '../shared/lieuxDansScope'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { bornesFraicheur } from '@/shared/fraicheur'
import {
  PointsVigilanceLieuxLoader,
  PointsVigilanceLieuxReadModel,
} from '@/use-cases/queries/RecupererPointsVigilanceLieux'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaPointsVigilanceLieuxLoader implements PointsVigilanceLieuxLoader {
  async get(scopeFiltre: ScopeFiltre, now: Date): Promise<ErrorReadModel | PointsVigilanceLieuxReadModel> {
    try {
      // Mêmes seuils que la liste des lieux (RG7 #1488) : « À actualiser » inclut les lieux sans date de mise à jour.
      const bornesAActualiser = bornesFraicheur('red', now)
      const bornesAVerifier = bornesFraicheur('orange', now)
      const scopeCte = buildLieuxDansScopeCte(scopeFiltre, 'actif')

      const result = await prisma.$queryRaw<Array<{ nb_a_actualiser: bigint; nb_a_verifier: bigint }>>`
        WITH ${scopeCte}
        SELECT
          SUM(CASE WHEN l.updated_at IS NULL OR l.updated_at <= ${bornesAActualiser.jusqua} THEN 1 ELSE 0 END) AS nb_a_actualiser,
          SUM(CASE WHEN l.updated_at > ${bornesAVerifier.apres} AND l.updated_at <= ${bornesAVerifier.jusqua} THEN 1 ELSE 0 END) AS nb_a_verifier
        FROM main.lieu_inclusion l
        JOIN lieux_dans_scope lds ON lds.id = l.id
      `

      return {
        nbLieuxAActualiser: Number(result[0]?.nb_a_actualiser ?? 0),
        nbLieuxAVerifier: Number(result[0]?.nb_a_verifier ?? 0),
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaPointsVigilanceLieuxLoader', {
        operation: 'get',
      })
      return {
        message: 'Impossible de récupérer les points de vigilance des lieux',
        type: 'error',
      }
    }
  }
}
