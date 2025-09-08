import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { MediateursEtAidantsLoader, MediateursEtAidantsReadModel } from '@/use-cases/queries/RecupererMediateursEtAidants'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaMediateursEtAidantsLoader implements MediateursEtAidantsLoader {
  async get(territoire: string): Promise<ErrorReadModel | MediateursEtAidantsReadModel> {
    try {
      // Récupérer toutes les personnes en poste
      const personnesEnPoste = await prisma.personneEnrichieView.findMany({
        where: {
          OR: [
            { est_actuellement_aidant_connect_en_poste: true },
            { est_actuellement_mediateur_en_poste: true }
          ]
        },
        select: {
          id: true,
          structure_employeuse_id: true,
          est_actuellement_aidant_connect_en_poste: true,
          est_actuellement_mediateur_en_poste: true
        }
      })

      let personnesFiltrees = personnesEnPoste

      // Si on filtre par territoire, récupérer les structures du département
      if (territoire !== 'France') {
        const structureIds = [...new Set(personnesEnPoste
          .filter(p => p.structure_employeuse_id)
          .map(p => p.structure_employeuse_id!))]
        
        const structures = await prisma.main_structure.findMany({
          where: { id: { in: structureIds } },
          select: {
            id: true,
            adresse_id: true
          }
        })

        const adresseIds = structures
          .filter(s => s.adresse_id)
          .map(s => s.adresse_id!)

        const adresses = await prisma.adresse.findMany({
          where: { 
            id: { in: adresseIds },
            departement: territoire
          },
          select: {
            id: true
          }
        })

        const adresseIdSet = new Set(adresses.map(a => a.id))
        const structuresInTerritoire = new Set(
          structures
            .filter(s => s.adresse_id && adresseIdSet.has(s.adresse_id))
            .map(s => s.id)
        )

        personnesFiltrees = personnesEnPoste
          .filter(p => p.structure_employeuse_id && structuresInTerritoire.has(p.structure_employeuse_id))
      }

      const nbActeursAc = personnesFiltrees.filter(p => p.est_actuellement_aidant_connect_en_poste).length
      const nbActeursMediateur = personnesFiltrees.filter(p => p.est_actuellement_mediateur_en_poste).length

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
