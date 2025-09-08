import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { 
  NiveauDeFormationLoader,
  NiveauDeFormationReadModel,
} from '@/use-cases/queries/RecupererNiveauDeFormation'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaNiveauDeFormationLoader implements NiveauDeFormationLoader {
  async get(territoire = 'France'): Promise<ErrorReadModel |NiveauDeFormationReadModel> {
    try {
      // Récupérer toutes les personnes en poste avec leurs structures employeuses
      const personnesEnPoste = await prisma.personneEnrichieView.findMany({
        where: {
          OR: [
            { est_actuellement_mediateur_en_poste: true },
            { est_actuellement_aidant_connect_en_poste: true }
          ]
        },
        select: {
          id: true,
          structure_employeuse_id: true
        }
      })

      // Si on filtre par territoire, récupérer les départements des structures
      let personnesIds = personnesEnPoste.map(p => p.id)
      
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
        const structuresInTerritoire = structures
          .filter(s => s.adresse_id && adresseIdSet.has(s.adresse_id))
          .map(s => s.id)

        personnesIds = personnesEnPoste
          .filter(p => p.structure_employeuse_id && structuresInTerritoire.includes(p.structure_employeuse_id))
          .map(p => p.id)
      }

      const totalAidantsEtMediateurs = personnesIds.length

      // Nombre d'aidants et médiateurs formés (en poste avec au moins une formation)
      const formations = await prisma.formation.findMany({
        where: {
          personne_id: { in: personnesIds }
        },
        select: {
          personne_id: true,
          label: true,
          pix: true,
          remn: true
        }
      })

      const personnesAvecFormation = new Set(formations.map(f => f.personne_id))
      const aidantsEtMediateursFormes = personnesAvecFormation.size

      // Répartition par certification (pour les personnes en poste)
      const certificationCounts = new Map<string, number>()
      
      formations.forEach((formation: typeof formations[0]) => {
        // Traiter chaque formation pour catégoriser les certifications
        const certifications: string[] = []
        
        if (formation.label === 'CCP1') certifications.push('CCP1')
        if (formation.label === 'CCP2') certifications.push('CCP2')
        if (formation.label === 'CCP2 & CCP3') certifications.push('CCP2 & CCP3')
        if (formation.pix === true) certifications.push('Pix')
        if (formation.remn === true) certifications.push('REMN')
        
        // Si la formation a un label qui n'est pas CCP et pas de pix/remn
        if (formation.label && 
            !['CCP1', 'CCP2', 'CCP2 & CCP3'].includes(formation.label) &&
            formation.pix !== true && 
            formation.remn !== true) {
          certifications.push('Autres')
        }
        
        // Incrémenter les compteurs pour chaque certification
        certifications.forEach(cert => {
          certificationCounts.set(cert, (certificationCounts.get(cert) || 0) + 1)
        })
      })

      const formationsFormatees = Array.from(certificationCounts.entries())
        .map(([nom, nombre]) => ({ nom, nombre }))
        .sort((a, b) => b.nombre - a.nombre)

      return {
        aidantsEtMediateursFormes,
        formations: formationsFormatees,
        totalAidantsEtMediateurs,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaNiveauDeFormationLoader', {
        operation: 'get',
        territoire,
      })
      return {
        message: 'Impossible de récupérer les données de niveau de formation',
        type: 'error',
      }
    }
  }
}