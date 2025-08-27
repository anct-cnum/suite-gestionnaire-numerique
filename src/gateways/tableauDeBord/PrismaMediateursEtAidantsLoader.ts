import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { MediateursEtAidantsLoader, MediateursEtAidantsReadModel } from '@/use-cases/queries/RecupererMediateursEtAidants'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaMediateursEtAidantsLoader implements MediateursEtAidantsLoader {
  async get(territoire: string): Promise<ErrorReadModel | MediateursEtAidantsReadModel> {
    try {
      let result: Array<{ nb_acteurs_ac: bigint; nb_acteurs_cn: bigint }>

      if (territoire === 'France') {
        result = await prisma.$queryRaw<Array<{ nb_acteurs_ac: bigint; nb_acteurs_cn: bigint }>>`
          WITH nb_acteurs_ac AS (
            SELECT COUNT(*) AS nb_acteurs_ac
            FROM main.personne p
            JOIN main.structure s ON p.structure_id = s.id
            JOIN main.adresse a ON s.adresse_id = a.id
            WHERE s.structure_ac_id IS NOT NULL 
              AND p.aidant_connect_id IS NOT NULL
              AND a.departement != 'zzz'
          ),
          nb_acteurs_cn AS (
            SELECT COUNT(*) AS nb_acteurs_cn
            FROM main.personne p
            JOIN main.personne_affectations pl ON p.id = pl.personne_id
            JOIN main.structure s2 ON s2.id = pl.structure_id
            JOIN main.adresse a2 ON s2.adresse_id = a2.id
            WHERE (p.conseiller_numerique_id IS NOT NULL OR p.cn_pg_id IS NOT NULL)
              AND a2.departement != 'zzz'
          )
          SELECT
            ac.nb_acteurs_ac,
            cn.nb_acteurs_cn
          FROM nb_acteurs_ac ac, nb_acteurs_cn cn
        `
      } else {
        result = await prisma.$queryRaw<Array<{ nb_acteurs_ac: bigint; nb_acteurs_cn: bigint }>>`
          WITH nb_acteurs_ac AS (
            SELECT COUNT(*) AS nb_acteurs_ac
            FROM main.personne p
            JOIN main.structure s ON p.structure_id = s.id
            JOIN main.adresse a ON s.adresse_id = a.id
            WHERE s.structure_ac_id IS NOT NULL 
              AND p.aidant_connect_id IS NOT NULL
              AND a.departement = ${territoire}
          ),
          nb_acteurs_cn AS (
            SELECT COUNT(*) AS nb_acteurs_cn
            FROM main.personne p
            JOIN main.personne_affectations pl ON p.id = pl.personne_id
            JOIN main.structure s2 ON s2.id = pl.structure_id
            JOIN main.adresse a2 ON s2.adresse_id = a2.id
            WHERE (p.conseiller_numerique_id IS NOT NULL OR p.cn_pg_id IS NOT NULL)
              AND a2.departement = ${territoire}
          )
          SELECT
            ac.nb_acteurs_ac,
            cn.nb_acteurs_cn
          FROM nb_acteurs_ac ac, nb_acteurs_cn cn
        `
      }

      const row = result[0]
      const nbActeursAc = Number(row.nb_acteurs_ac)
      const nbActeursCn = Number(row.nb_acteurs_cn)

      return {
        departement: territoire,
        nombreAidants: nbActeursAc,
        nombreMediateurs: nbActeursCn,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaMediateursEtAidantsLoader', {
        operation: 'get',
        territoire,
      })
      return {
        message: 'Impossible de récupérer les données des médiateurs et aidants numériques',
        type: 'error',
      }
    }
  }
}
