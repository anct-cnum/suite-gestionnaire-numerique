import { Prisma } from '@prisma/client'

import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import {
  MediateursEtAidantsLoader,
  MediateursEtAidantsReadModel,
} from '@/use-cases/queries/RecupererMediateursEtAidants'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'
import { FiltreTerritorial, libelleFiltreTerritorial } from '@/use-cases/queries/shared/FiltreTerritorial'

export class PrismaMediateursEtAidantsLoader implements MediateursEtAidantsLoader {
  async get(filtre: FiltreTerritorial): Promise<ErrorReadModel | MediateursEtAidantsReadModel> {
    try {
      let total: number

      if (filtre.type === 'national') {
        // Pour la France, on peut compter directement
        total = await prisma.personneEnrichieView.count({
          where: {
            OR: [{ est_actuellement_aidant_numerique_en_poste: true }, { est_actuellement_mediateur_en_poste: true }],
          },
        })
      } else {
        // Récupérer les IDs des structures dans le périmètre
        // Refonte 2026 : structure_employeuse_id (utilise plus bas) pointe sur SA.
        const structuresDansLePerimetre = await prisma.main_structure_administrative.findMany({
          select: { id: true },
          where: {
            adresse: this.#adresseWhere(filtre),
          },
        })

        const structureIds = structuresDansLePerimetre.map((structure) => structure.id)

        // Compter les personnes en poste dans ces structures
        total = await prisma.personneEnrichieView.count({
          where: {
            AND: [
              {
                OR: [
                  { est_actuellement_aidant_numerique_en_poste: true },
                  { est_actuellement_mediateur_en_poste: true },
                ],
              },
              {
                structure_employeuse_id: { in: structureIds },
              },
            ],
          },
        })
      }

      return {
        departement: libelleFiltreTerritorial(filtre),
        total,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaMediateursEtAidantsLoader', {
        operation: 'get',
        territoire: libelleFiltreTerritorial(filtre),
      })
      return {
        message: 'Impossible de récupérer les données des médiateurs et aidants numériques',
        type: 'error',
      }
    }
  }

  #adresseWhere(filtre: Exclude<FiltreTerritorial, Readonly<{ type: 'national' }>>): Prisma.adresseWhereInput {
    switch (filtre.type) {
      case 'communes':
        return { code_insee: { in: [...filtre.codesInsee] } }
      case 'departement':
        return { departement: filtre.code }
      case 'departements':
        return { departement: { in: [...filtre.codes] } }
    }
  }
}
