import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { MediateursEtAidantsLoader, MediateursEtAidantsReadModel } from '@/use-cases/queries/RecupererMediateursEtAidants'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaMediateursEtAidantsLoader implements MediateursEtAidantsLoader {
  async get(territoire: string): Promise<ErrorReadModel | MediateursEtAidantsReadModel> {
    try {
      let result: Array<{ nb_acteurs_ac: bigint; nb_acteurs_mediateur: bigint }>

      if (territoire === 'France') {
        result = await prisma.$queryRaw<Array<{ nb_acteurs_ac: bigint; nb_acteurs_mediateur: bigint }>>`
          SELECT
            COUNT(*) FILTER (WHERE est_actuellement_aidant_numerique_en_poste = true) AS nb_acteurs_ac,
            COUNT(*) FILTER (WHERE est_actuellement_mediateur_en_poste = true) AS nb_acteurs_mediateur
          FROM min.personne_enrichie
        `
      } else {
        result = await prisma.$queryRaw<Array<{ nb_acteurs_ac: bigint; nb_acteurs_mediateur: bigint }>>`
          SELECT
            COUNT(*) FILTER (WHERE est_actuellement_aidant_numerique_en_poste = true) AS nb_acteurs_ac,
            COUNT(*) FILTER (WHERE est_actuellement_mediateur_en_poste = true) AS nb_acteurs_mediateur
          FROM min.personne_enrichie
          WHERE departement_employeur = ${territoire}
        `
      }

      const row = result[0]
      const nbActeursAc = Number(row.nb_acteurs_ac)
      const nbActeursMediateur = Number(row.nb_acteurs_mediateur)

      return {
        departement: territoire,
        nombreAidants: nbActeursAc,
        nombreMediateurs: nbActeursMediateur,
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
