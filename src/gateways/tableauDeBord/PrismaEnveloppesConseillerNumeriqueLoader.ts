import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import {
  EnveloppeConseillerNumeriqueReadModel,
  EnveloppesConseillerNumeriqueLoader,
  EnveloppesConseillerNumeriqueReadModel,
} from '@/use-cases/queries/RecupererLesEnveloppesConseillerNumerique'

export class PrismaEnveloppesConseillerNumeriqueLoader implements EnveloppesConseillerNumeriqueLoader {
  async get(codeDepartement: string): Promise<EnveloppesConseillerNumeriqueReadModel> {
    try {
      const rows =
        codeDepartement === 'france' ? await this.#queryFrance() : await this.#queryDepartement(codeDepartement)

      return {
        enveloppes: rows.map(
          (row): EnveloppeConseillerNumeriqueReadModel => ({
            consommation: row.consommation,
            dateDeDebut: row.dateDeDebut,
            dateDeFin: row.dateDeFin,
            libelle: row.libelle,
            plafond: row.plafond,
          })
        ),
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaEnveloppesConseillerNumeriqueLoader', {
        codeDepartement,
        operation: 'get',
      })
      return { enveloppes: [] }
    }
  }

  async getParStructure(structureId: number): Promise<EnveloppesConseillerNumeriqueReadModel> {
    try {
      const rows = await prisma.$queryRaw<Array<QueryResult>>`
        WITH agg AS (
          SELECT
            COALESCE(SUM(s.montant_subvention_v1), 0)::bigint AS total_v1,
            COALESCE(SUM(s.montant_subvention_v2), 0)::bigint AS total_v2
          FROM main.subvention s
          JOIN main.poste p ON p.id = s.poste_id
          WHERE p.structure_id = ${structureId}
        )
        SELECT
          e.libelle,
          e.date_debut AS "dateDeDebut",
          e.date_fin AS "dateDeFin",
          0 AS plafond,
          CASE
            WHEN e.libelle LIKE '%Renouvellement%' THEN agg.total_v2
            WHEN e.libelle LIKE '%Plan France Relance%' THEN agg.total_v1
            ELSE 0
          END AS consommation
        FROM min.enveloppe_financement e
        CROSS JOIN agg
        WHERE e.libelle LIKE 'Conseiller Numérique%'
        ORDER BY e.libelle
      `

      return {
        enveloppes: rows.map(
          (row): EnveloppeConseillerNumeriqueReadModel => ({
            consommation: row.consommation,
            dateDeDebut: row.dateDeDebut,
            dateDeFin: row.dateDeFin,
            libelle: row.libelle,
            plafond: row.plafond,
          })
        ),
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaEnveloppesConseillerNumeriqueLoader', {
        operation: 'getParStructure',
        structureId,
      })
      return { enveloppes: [] }
    }
  }

  async #queryDepartement(code: string): Promise<ReadonlyArray<QueryResult>> {
    return prisma.$queryRaw<Array<QueryResult>>`
      WITH agg AS (
        SELECT
          COALESCE(SUM(s.montant_subvention_v1), 0)::bigint AS total_v1,
          COALESCE(SUM(s.montant_subvention_v2), 0)::bigint AS total_v2
        FROM main.subvention s
        JOIN main.poste p ON p.id = s.poste_id
        JOIN main.structure st ON st.id = p.structure_id
        JOIN main.adresse a ON a.id = st.adresse_id
        WHERE a.departement = ${code}
      )
      SELECT
        e.libelle,
        e.date_debut AS "dateDeDebut",
        e.date_fin AS "dateDeFin",
        COALESCE(de.plafond, 0) AS plafond,
        CASE
          WHEN e.libelle LIKE '%Renouvellement%' THEN agg.total_v2
          WHEN e.libelle LIKE '%Plan France Relance%' THEN agg.total_v1
          ELSE 0
        END AS consommation
      FROM min.enveloppe_financement e
      CROSS JOIN agg
      LEFT JOIN min.departement_enveloppe de
        ON de.enveloppe_id = e.id AND de.departement_code = ${code}
      WHERE e.libelle LIKE 'Conseiller Numérique%'
      ORDER BY e.libelle
    `
  }

  async #queryFrance(): Promise<ReadonlyArray<QueryResult>> {
    return prisma.$queryRaw<Array<QueryResult>>`
      WITH agg AS (
        SELECT
          COALESCE(SUM(s.montant_subvention_v1), 0)::bigint AS total_v1,
          COALESCE(SUM(s.montant_subvention_v2), 0)::bigint AS total_v2
        FROM main.subvention s
      )
      SELECT
        e.libelle,
        e.date_debut AS "dateDeDebut",
        e.date_fin AS "dateDeFin",
        e.montant AS plafond,
        CASE
          WHEN e.libelle LIKE '%Renouvellement%' THEN agg.total_v2
          WHEN e.libelle LIKE '%Plan France Relance%' THEN agg.total_v1
          ELSE 0
        END AS consommation
      FROM min.enveloppe_financement e
      CROSS JOIN agg
      WHERE e.libelle LIKE 'Conseiller Numérique%'
      ORDER BY e.libelle
    `
  }
}

type QueryResult = {
  consommation: bigint
  dateDeDebut: Date
  dateDeFin: Date
  libelle: string
  plafond: number
}
