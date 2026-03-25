import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { DonneesStructureLoader, DonneesStructureReadModel } from '@/use-cases/queries/RecupererDonneesStructure'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaDonneesStructureLoader implements DonneesStructureLoader {
  readonly #structureDao = prisma.main_structure

  async get(structureId: number, maintenant: Date): Promise<DonneesStructureReadModel | ErrorReadModel> {
    try {
      const structure = await this.#structureDao.findUnique({
        select: {
          structure_cartographie_nationale_id: true,
        },
        where: { id: structureId },
      })

      const nombreLieux = structure?.structure_cartographie_nationale_id === null ? 0 : 1
      const nombreMediateurs = await prisma.personne_affectations.count({
        where: { est_active: true, structure_id: structureId },
      })

      const accompagnementsParMois = await prisma.$queryRaw<Array<{
        mois: Date
        total: bigint
      }>>`
        SELECT
          periode AS mois,
          SUM(accompagnements) AS total
        FROM main.activites_coop
        WHERE structure_id = ${structureId}
          AND periode >= date_trunc('month', ${maintenant}::timestamp) - INTERVAL '5 months'
          AND periode <= date_trunc('month', ${maintenant}::timestamp)
        GROUP BY periode
        ORDER BY periode ASC
      `

      const totalAccompagnements = accompagnementsParMois.reduce(
        (sum, row) => sum + Number(row.total),
        0
      )

      const accompagnementsMensuels = accompagnementsParMois.map((row) => ({
        mois: row.mois.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        nombre: Number(row.total),
      }))

      return {
        accompagnementsMensuels,
        nombreLieux,
        nombreMediateurs,
        totalAccompagnements,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaDonneesStructureLoader', {
        operation: 'get',
        structureId,
      })
      return {
        message: 'Impossible de récupérer les données de la structure',
        type: 'error',
      }
    }
  }
}
