import prisma from '../../../prisma/prismaClient'
import { createApiCoopStatistiquesLoader } from '../factories/apiCoopLoaderFactory'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { DonneesStructureLoader, DonneesStructureReadModel } from '@/use-cases/queries/RecupererDonneesStructure'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaDonneesStructureLoader implements DonneesStructureLoader {
  async get(structureId: number, maintenant: Date): Promise<DonneesStructureReadModel | ErrorReadModel> {
    try {
      const lieuxCoopIds = await this.#recupererLieuxCoopIds(structureId)

      const nombreLieux = lieuxCoopIds.length

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

      let totalAccompagnements = 0
      let accompagnementsMensuels: DonneesStructureReadModel['accompagnementsMensuels'] = []

      if (lieuxCoopIds.length > 0) {
        const statistiquesCoop = await createApiCoopStatistiquesLoader().recupererStatistiques({
          lieux: lieuxCoopIds,
        })

        accompagnementsMensuels = Array.from({ length: 6 }, (_, index) => {
          const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - 5 + index, 1)
          const cle = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
          const moisParMois = statistiquesCoop.accompagnementsParMois.find((item) => {
            const itemDate = this.#parseLabelToDate(item.label)
            return itemDate !== null && itemDate.getTime() === date.getTime()
          })
          return {
            mois: cle,
            nombre: moisParMois?.count ?? 0,
          }
        })

        totalAccompagnements = accompagnementsMensuels.reduce((sum, item) => sum + item.nombre, 0)
      }

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

  #parseLabelToDate(label: string): Date | null {
    const parts = label.split('/')
    if (parts.length === 2) {
      const month = parseInt(parts[0], 10) - 1
      const year = 2000 + parseInt(parts[1], 10)
      return new Date(year, month, 1)
    }
    return null
  }

  async #recupererLieuxCoopIds(structureId: number): Promise<ReadonlyArray<string>> {
    const rows = await prisma.$queryRaw<ReadonlyArray<{ structure_coop_id: string }>>`
      SELECT l.structure_coop_id
      FROM main.lieu_inclusion l
      WHERE l.structure_coop_id IS NOT NULL
        AND (
          EXISTS (
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
        )
    `
    return rows.map((row) => row.structure_coop_id)
  }
}
