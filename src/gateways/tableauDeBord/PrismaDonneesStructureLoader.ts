import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { DonneesStructureLoader, DonneesStructureReadModel } from '@/use-cases/queries/RecupererDonneesStructure'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaDonneesStructureLoader implements DonneesStructureLoader {
  async get(structureId: number, maintenant: Date): Promise<DonneesStructureReadModel | ErrorReadModel> {
    try {
      const nombreLieuxResult = await prisma.$queryRaw<Array<{ total: bigint }>>`
        SELECT COUNT(*)::bigint AS total
        FROM main.structure s
        WHERE (
            s.id = ${structureId}
            OR EXISTS (
              SELECT 1 FROM main.personne_affectations pa_lieu
              WHERE pa_lieu.structure_id = s.id AND pa_lieu.est_active = true
              AND pa_lieu.personne_id IN (
                SELECT pa.personne_id FROM main.personne_affectations pa
                WHERE pa.structure_id = ${structureId} AND pa.est_active = true
                UNION
                SELECT pe.id FROM min.personne_enrichie pe
                WHERE pe.structure_employeuse_id = ${structureId}
              )
            )
          )
      `
      const nombreLieux = Number(nombreLieuxResult[0]?.total ?? 0)

      const nombreMediateursResult = await prisma.$queryRaw<Array<{ total: bigint }>>`
        SELECT COUNT(DISTINCT pe.id)::bigint AS total
        FROM min.personne_enrichie pe
        WHERE (pe.est_actuellement_mediateur_en_poste = true OR pe.est_actuellement_aidant_numerique_en_poste = true)
          AND (
            pe.structure_employeuse_id = ${structureId}
            OR EXISTS (
              SELECT 1 FROM main.personne_affectations aff
              WHERE aff.personne_id = pe.id AND aff.est_active = true AND aff.structure_id = ${structureId}
            )
          )
      `
      const nombreMediateurs = Number(nombreMediateursResult[0]?.total ?? 0)

      const accompagnementsParMois = await prisma.$queryRaw<
        Array<{
          mois: Date
          total: bigint
        }>
      >`
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

      const totalAccompagnements = accompagnementsParMois.reduce((sum, row) => sum + Number(row.total), 0)

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
