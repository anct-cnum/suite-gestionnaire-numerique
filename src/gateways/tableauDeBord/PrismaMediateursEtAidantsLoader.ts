import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { MediateursEtAidantsLoader, MediateursEtAidantsReadModel } from '@/use-cases/queries/RecupererMediateursEtAidants'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaMediateursEtAidantsLoader implements MediateursEtAidantsLoader {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async get(codeDepartement: string): Promise<ErrorReadModel | MediateursEtAidantsReadModel> {
    try {
      const result = await prisma.$queryRaw<Array<{ nb_acteurs_ac: bigint; nb_acteurs_cn: bigint }>>`
        WITH nb_acteurs_ac AS (
          SELECT COUNT(*) AS nb_acteurs_ac
          FROM main.personne p
          JOIN main.structure s ON p.id_structure_ac = s.id_structure_ac
          JOIN main.adresse a ON s.adresse_id = a.id
          WHERE a.departement = ${codeDepartement}
        ),
        nb_acteurs_cn AS (
          SELECT COUNT(*) AS nb_acteurs_cn
          FROM main.personne p
          JOIN main.personne_lieux_activites pl ON p.id = pl.personne_id
          JOIN main.structure s2 ON s2.id = pl.structure_id
          JOIN main.adresse a2 ON s2.adresse_id = a2.id
          WHERE a2.departement = ${codeDepartement}
        )
        SELECT 
          ac.nb_acteurs_ac,
          cn.nb_acteurs_cn
        FROM nb_acteurs_ac ac, nb_acteurs_cn cn
      `

      const row = result[0]
      const nbActeursAc = Number(row.nb_acteurs_ac)
      const nbActeursCn = Number(row.nb_acteurs_cn)

      return {
        departement: codeDepartement,
        nombreAidants: nbActeursAc,
        nombreMediateurs: nbActeursCn,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaMediateursEtAidantsLoader', {
        codeDepartement,
        operation: 'get',
      })
      return {
        message: 'Impossible de récupérer les données des médiateurs et aidants numériques',
        type: 'error',
      }
    }
  }
} 