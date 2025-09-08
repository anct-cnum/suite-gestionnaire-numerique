import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { MediateursEtAidantsLoader, MediateursEtAidantsReadModel } from '@/use-cases/queries/RecupererMediateursEtAidants'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaMediateursEtAidantsLoader implements MediateursEtAidantsLoader {
  async get(territoire: string): Promise<ErrorReadModel | MediateursEtAidantsReadModel> {
    try {
      let total: number

      if (territoire === 'France') {
        // Pour la France, on peut compter directement
        total = await prisma.personneEnrichieView.count({
          where: {
            OR: [
              { est_actuellement_aidant_numerique_en_poste: true },
              { est_actuellement_mediateur_en_poste: true }
            ]
          }
        })
      } else {
        // Récupérer les IDs des structures dans le département
        const structuresInDepartment = await prisma.main_structure.findMany({
          where: {
            adresse: {
              departement: territoire
            }
          },
          select: { id: true }
        })
        
        const structureIds = structuresInDepartment.map(s => s.id)
        
        // Compter les personnes en poste dans ces structures
        total = await prisma.personneEnrichieView.count({
          where: {
            AND: [
              {
                OR: [
                  { est_actuellement_aidant_numerique_en_poste: true },
                  { est_actuellement_mediateur_en_poste: true }
                ]
              },
              {
                structure_employeuse_id: { in: structureIds }
              }
            ]
          }
        })
      }

      return {
        departement: territoire,
        total,
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
