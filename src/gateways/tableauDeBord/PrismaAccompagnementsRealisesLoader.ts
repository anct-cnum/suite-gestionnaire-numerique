import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { AccompagnementsRealisesLoader, AccompagnementsRealisesReadModel } from '@/use-cases/queries/RecupererAccompagnementsRealises'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaAccompagnementsRealisesLoader implements AccompagnementsRealisesLoader {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async get(codeDepartement: string): Promise<AccompagnementsRealisesReadModel | ErrorReadModel> {
    try {
      // Récupération du total des accompagnements
      const totalResult = await prisma.$queryRaw<Array<{ total_accompagnements: bigint }>>`
        WITH all_activites_coop AS (
          SELECT COUNT(*) AS nb_activites_coop
          FROM main.activites_coop ac
          JOIN main.structure s2 on ac.structure_id_coop = s2.structure_id_coop
          JOIN main.adresse a2 ON s2.adresse_id = a2.id
          WHERE a2.departement = ${codeDepartement}
        ),
        sum_accompagnements_ac AS (
          SELECT SUM(p.nb_accompagnements_ac) AS total_accompagnements
          FROM main.personne p
          JOIN main.structure s ON p.id_structure_ac = s.id_structure_ac
          JOIN main.adresse a ON s.adresse_id = a.id
          WHERE a.departement = ${codeDepartement}
        )
        SELECT 
          COALESCE(total_accompagnements, 0) + COALESCE(nb_activites_coop, 0) AS total_accompagnements
        FROM sum_accompagnements_ac, all_activites_coop
      `

      // Récupération de la répartition mensuelle (activités COOP uniquement car on a les dates)
      const repartitionResult = await prisma.$queryRaw<Array<{ mois: string; nombre: bigint }>>`
        SELECT 
          TO_CHAR(ac.date, 'MM/YY') as mois,
          COUNT(*) as nombre
        FROM main.activites_coop ac
        JOIN main.structure s ON ac.structure_id_coop = s.structure_id_coop
        JOIN main.adresse a ON s.adresse_id = a.id
        WHERE a.departement = ${codeDepartement}
          AND ac.date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
          AND ac.date < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')
        GROUP BY TO_CHAR(ac.date, 'MM/YY')
        ORDER BY mois
      `

      return {
        departement: codeDepartement,
        nombreTotal: Number(totalResult[0]?.total_accompagnements ?? 0),
        repartitionMensuelle: repartitionResult.map((item) => ({
          mois: item.mois,
          nombre: Number(item.nombre),
        })),
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaAccompagnementsRealisesLoader', {
        codeDepartement,
        operation: 'get',
      })
      return {
        message: 'Impossible de récupérer les données des accompagnements réalisés',
        type: 'error',
      }
    }
  }
} 