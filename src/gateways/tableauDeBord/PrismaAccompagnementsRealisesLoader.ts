import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { AccompagnementsRealisesLoader, AccompagnementsRealisesReadModel } from '@/use-cases/queries/RecupererAccompagnementsRealises'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaAccompagnementsRealisesLoader implements AccompagnementsRealisesLoader {
  async get(territoire: string): Promise<AccompagnementsRealisesReadModel | ErrorReadModel> {
    try {
      // Récupération du total des accompagnements
      let totalResult: Array<{ total_accompagnements: bigint }>

      if (territoire === 'France') {
        totalResult = await prisma.$queryRaw<Array<{ total_accompagnements: bigint }>>`
          WITH all_activites_coop AS (
            SELECT SUM(ac.accompagnements) AS nb_activites_coop
            FROM main.activites_coop ac
          ),
          sum_accompagnements_ac AS (
            SELECT SUM(pe.nb_accompagnements_ac) AS total_accompagnements
            FROM min.personne_enrichie pe
            WHERE pe.type_accompagnateur = 'aidant_numerique'   
          )
          SELECT
            COALESCE(total_accompagnements, 0) + COALESCE(nb_activites_coop, 0) AS total_accompagnements
          FROM sum_accompagnements_ac, all_activites_coop
        `
      } else {
        totalResult = await prisma.$queryRaw<Array<{ total_accompagnements: bigint }>>`
          WITH all_activites_coop AS (
            SELECT a2.departement, SUM(ac.accompagnements) AS nb_activites_coop
            FROM main.activites_coop ac
            JOIN main.structure s2 ON ac.structure_id = s2.id
            JOIN main.adresse a2 ON s2.adresse_id = a2.id
            WHERE a2.departement = ${territoire}
            GROUP BY a2.departement
          ),
          sum_accompagnements_ac AS (
            SELECT a.departement, SUM(pe.nb_accompagnements_ac) AS total_accompagnements
            FROM min.personne_enrichie pe
            LEFT JOIN main.structure s ON s.id = pe.structure_employeuse_id
            LEFT JOIN main.adresse a ON a.id = s.adresse_id
            WHERE pe.type_accompagnateur = 'aidant_numerique'   
              AND a.departement = ${territoire}
            GROUP BY a.departement
          )
          SELECT
            COALESCE(total_accompagnements, 0) + COALESCE(nb_activites_coop, 0) AS total_accompagnements
          FROM sum_accompagnements_ac a
          FULL OUTER JOIN all_activites_coop al ON a.departement = al.departement
        `
      }

      const nombreTotal = Number(totalResult[0]?.total_accompagnements ?? 0)

      // Récupération de la répartition mensuelle (activités COOP uniquement car on a les dates)
      let repartitionResult: Array<{ mois: string; nombre: bigint }>

      if (territoire === 'France') {
        repartitionResult = await prisma.$queryRaw<Array<{ mois: string; nombre: bigint }>>`
          SELECT
            TO_CHAR(ac.date, 'MM/YY') as mois,
            SUM(ac.accompagnements) as nombre
          FROM main.activites_coop ac
          JOIN main.structure s ON ac.structure_id = s.id
          JOIN main.adresse a ON s.adresse_id = a.id
          WHERE ac.date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
            AND ac.date < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')
          GROUP BY TO_CHAR(ac.date, 'MM/YY')
          ORDER BY mois
        `
      } else {
        repartitionResult = await prisma.$queryRaw<Array<{ mois: string; nombre: bigint }>>`
          SELECT
            TO_CHAR(ac.date, 'MM/YY') as mois,
            SUM(ac.accompagnements) as nombre
          FROM main.activites_coop ac
          JOIN main.structure s ON ac.structure_id = s.id
          JOIN main.adresse a ON s.adresse_id = a.id
          WHERE a.departement = ${territoire}
            AND ac.date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
            AND ac.date < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')
          GROUP BY TO_CHAR(ac.date, 'MM/YY')
          ORDER BY mois
        `
      }

      return {
        departement: territoire,
        nombreTotal,
        repartitionMensuelle: repartitionResult.map((item) => ({
          mois: item.mois,
          nombre: Number(item.nombre),
        })),
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaAccompagnementsRealisesLoader', {
        operation: 'get',
        territoire,
      })
      return {
        message: 'Impossible de récupérer les données des accompagnements réalisés',
        type: 'error',
      }
    }
  }
}
