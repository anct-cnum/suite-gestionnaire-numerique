/* eslint-disable @stylistic/quote-props */
 
import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { AccompagnementsRealisesLoader, AccompagnementsRealisesReadModel } from '@/use-cases/queries/RecupererAccompagnementsRealises'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

const accompagnementsPrecedents = {
  '01' : 73203,
  '02' : 55494,
  '03' : 25344,
  '04' : 16797,
  '05' : 25265,
  '06' : 52805,
  '07' : 30028,
  '08' : 50136,
  '09' : 15088,
  '10' : 40838,
  '11' : 25567,
  '12' : 29373,
  '13' : 99259,
  '14' : 56448,
  '15' : 22662,
  '16' : 34858,
  '17' : 49176,
  '18':	29745,
  '19':	24835,
  '21':	41485,
  '22':	52508,
  '23':	12628,
  '24':	41978,
  '25':	40156,
  '26':	39977,
  '27':	43201,
  '28':	17034,
  '29':	57078,
  '2A':	6222,
  '2B':	12951,
  '30':	60576,
  '31':	64293,
  '32':	16482,
  '33':	120061,
  '34':	103205,
  '35':	66024,
  '36':	33153,
  '37':	32018,
  '38':	37971,
  '39':	18457,
  '40':	37778,
  '41':	28875,
  '42':	44376,
  '43':	28105,
  '44':	59232,
  '45':	32924,
  '46':	25118,
  '47':	53169,
  '48':	24098,
  '49':	45939,
  '50':	40917,
  '51':	37904,
  '52':	27999,
  '53':	21277,
  '54':	60632,
  '55':	30011,
  '56':	69487,
  '57':	61547,
  '58':	36422,
  '59':	164189,
  '60':	20814,
  '61':	32516,
  '62':	71215,
  '63':	33460,
  '64':	48566,
  '65':	25975,
  '66':	67940,
  '67':	52144,
  '68':	32337,
  '69':	97769,
  '70':	54105,
  '71':	42693,
  '72':	59361,
  '73':	26467,
  '74':	33269,
  '75':	101437,
  '76':	63568,
  '77':	41533,
  '78':	38215,
  '79':	28293,
  '80':	27417,
  '81':	41483,
  '82':	35388,
  '83':	66804,
  '84':	55917,
  '85':	52031,
  '86':	41101,
  '87':	41051,
  '88':	45978,
  '89':	24331,
  '90':	15640,
  '91':	47277,
  '92':	41316,
  '93':	90999,
  '94':	55436,
  '95':	36386,
  '971':	40934,
  '972':	45001,
  '973':	17797,
  '974':	87751,
  '976':	25783,
}

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

      let nombreTotal = Number(totalResult[0]?.total_accompagnements ?? 0)
      if (codeDepartement in accompagnementsPrecedents) {
        nombreTotal += accompagnementsPrecedents[codeDepartement as keyof typeof accompagnementsPrecedents]
      }
      
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
        nombreTotal,
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