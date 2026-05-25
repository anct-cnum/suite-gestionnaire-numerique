import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { DonneesStructureLoader, DonneesStructureReadModel } from '@/use-cases/queries/RecupererDonneesStructure'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaDonneesStructureLoader implements DonneesStructureLoader {
  async get(structureId: number, maintenant: Date): Promise<DonneesStructureReadModel | ErrorReadModel> {
    try {
      // Refonte 2026 : structureId refere a main.structure_administrative.id.
      // Les lieux de cette SA sont resolus via la table d'asso
      // main.lieu_inclusion_structure_administrative, OU via les affectations
      // de personnes employees par la SA qui travaillent sur d'autres lieux.
      const nombreLieuxResult = await prisma.$queryRaw<Array<{ total: bigint }>>`
        SELECT COUNT(*)::bigint AS total
        FROM main.lieu_inclusion l
        WHERE EXISTS (
            SELECT 1 FROM main.lieu_inclusion_structure_administrative asso
            WHERE asso.lieu_id = l.id AND asso.structure_administrative_id = ${structureId}
          )
          OR EXISTS (
            SELECT 1 FROM main.personne_affectations_lieu pal
            WHERE pal.lieu_id = l.id AND pal.est_active = true
              AND pal.personne_id IN (
                SELECT pae.personne_id FROM main.personne_affectations_emploi pae
                WHERE pae.structure_administrative_id = ${structureId} AND pae.est_active = true
                UNION
                SELECT pe.id FROM min.personne_enrichie pe
                WHERE pe.structure_employeuse_id = ${structureId}
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
              SELECT 1 FROM main.personne_affectations_emploi pae
              WHERE pae.personne_id = pe.id AND pae.est_active = true AND pae.structure_administrative_id = ${structureId}
            )
          )
      `
      const nombreMediateurs = Number(nombreMediateursResult[0]?.total ?? 0)

      // Refonte 2026 : activites_coop indexe desormais par lieu_id (V084 dataspace).
      // On agrege les activites de tous les lieux associes a cette SA via l'asso.
      const accompagnementsParMois = await prisma.$queryRaw<
        Array<{
          mois: Date
          total: bigint
        }>
      >`
        SELECT
          ac.periode AS mois,
          SUM(ac.accompagnements) AS total
        FROM main.activites_coop ac
        JOIN main.lieu_inclusion_structure_administrative asso
          ON asso.lieu_id = ac.lieu_id
        WHERE asso.structure_administrative_id = ${structureId}
          AND ac.periode >= date_trunc('month', ${maintenant}::timestamp) - INTERVAL '5 months'
          AND ac.periode <= date_trunc('month', ${maintenant}::timestamp)
        GROUP BY ac.periode
        ORDER BY ac.periode ASC
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
