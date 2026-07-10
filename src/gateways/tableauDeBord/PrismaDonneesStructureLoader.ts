import { Prisma } from '@prisma/client'

import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { DonneesStructureLoader, DonneesStructureReadModel } from '@/use-cases/queries/RecupererDonneesStructure'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaDonneesStructureLoader implements DonneesStructureLoader {
  async get(structureId: number, maintenant: Date): Promise<DonneesStructureReadModel | ErrorReadModel> {
    try {
      const [nombreMediateurs, nombreLieux, accompagnementsMensuels] = await Promise.all([
        this.#compterMediateurs(structureId),
        this.#compterLieux(structureId),
        this.#recupererAccompagnementsMensuels(structureId, maintenant),
      ])

      const totalAccompagnements = accompagnementsMensuels.reduce((sum, item) => sum + item.nombre, 0)

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

  // Même règle « lieu actif » que le listing (PrismaListeLieuxInclusionLoader) :
  // un lieu rattaché à la SA par la seule asso (carto, pont siret) mais sans plus
  // aucune affectation active est archivé et ne doit pas être compté (#1560).
  async #compterLieux(structureId: number): Promise<number> {
    const result = await prisma.$queryRaw<ReadonlyArray<{ total: bigint }>>`
      SELECT COUNT(DISTINCT l.id)::bigint AS total
      FROM main.lieu_inclusion l
      WHERE (EXISTS (
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
        ))
        AND EXISTS (
          SELECT 1 FROM main.personne_affectations_lieu pal_active
          WHERE pal_active.lieu_id = l.id AND pal_active.est_active = true
        )
    `
    return Number(result[0]?.total ?? 0)
  }

  async #compterMediateurs(structureId: number): Promise<number> {
    const result = await prisma.$queryRaw<ReadonlyArray<{ total: bigint }>>`
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
    return Number(result[0]?.total ?? 0)
  }

  async #recupererAccompagnementsMensuels(
    structureId: number,
    maintenant: Date
  ): Promise<DonneesStructureReadModel['accompagnementsMensuels']> {
    const debut = new Date(maintenant.getFullYear(), maintenant.getMonth() - 5, 1)
    const fin = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 1)
    const debutPeriode = `${debut.getFullYear()}-${String(debut.getMonth() + 1).padStart(2, '0')}-01`
    const finPeriode = `${fin.getFullYear()}-${String(fin.getMonth() + 1).padStart(2, '0')}-01`

    const rows = await prisma.$queryRaw<ReadonlyArray<{ mois: string; nombre: bigint }>>(
      Prisma.sql`
        SELECT
          to_char(date_trunc('month', a.date), 'YYYY-MM-DD') AS mois,
          COALESCE(SUM(a.accompagnements_count), 0)::bigint AS nombre
        FROM coop.activites a
        WHERE a.structure_employeuse_id = (
          SELECT sa.structure_coop_id
          FROM main.structure_administrative sa
          WHERE sa.id = ${structureId}
        )
          AND a.suppression IS NULL
          AND a.date >= ${debutPeriode}::date
          AND a.date < ${finPeriode}::date
        GROUP BY date_trunc('month', a.date)
        ORDER BY mois
      `
    )

    const resultatsParMois = new Map(
      rows.map((row) => {
        const [year, month] = row.mois.split('-').map(Number)
        const date = new Date(year, month - 1, 1)
        return [date.getTime(), Number(row.nombre)]
      })
    )

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - 5 + index, 1)
      const cle = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
      return {
        mois: cle,
        nombre: resultatsParMois.get(date.getTime()) ?? 0,
      }
    })
  }
}
