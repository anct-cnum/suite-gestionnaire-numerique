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
        select: {
          id: true,
          structure_employeuse_id: true,
        },
        where: {
          OR: [
            { est_actuellement_mediateur_en_poste: true },
            { est_actuellement_aidant_numerique_en_poste: true },
          ],
        },
      })

      // Si on filtre par territoire, récupérer les départements des structures
      let personnesIds = personnesEnPoste.map(personne => personne.id)
      
      if (territoire !== 'France') {
        const structureIds = [...new Set(personnesEnPoste
          .filter((personne): personne is { structure_employeuse_id: number } & typeof personne => 
            personne.structure_employeuse_id !== null)
          .map(personne => personne.structure_employeuse_id))]
        
        const structures = await prisma.main_structure.findMany({
          select: {
            adresse_id: true,
            id: true,
          },
          where: { id: { in: structureIds } },
        })

        const adresseIds = structures
          .filter((structure): structure is { adresse_id: number } & typeof structure => 
            structure.adresse_id !== null)
          .map(structure => structure.adresse_id)

        const adresses = await prisma.adresse.findMany({
          select: {
            id: true,
          },
          where: { 
            departement: territoire,
            id: { in: adresseIds },
          },
        })

        const adresseIdSet = new Set(adresses.map(adresse => adresse.id))
        const structuresInTerritoire = structures
          .filter((structure): structure is { adresse_id: number } & typeof structure => 
            structure.adresse_id !== null && adresseIdSet.has(structure.adresse_id))
          .map(structure => structure.id)

        personnesIds = personnesEnPoste
          .filter((personne): personne is { structure_employeuse_id: number } & typeof personne => 
            personne.structure_employeuse_id !== null && 
          structuresInTerritoire.includes(personne.structure_employeuse_id))
          .map(personne => personne.id)
      }

      const totalAidantsEtMediateurs = personnesIds.length

      // Nombre d'aidants et médiateurs formés (en poste avec au moins une formation)
      const formations = await prisma.formation.findMany({
        select: {
          label: true,
          personne_id: true,
          pix: true,
          remn: true,
        },
        where: {
          personne_id: { in: personnesIds },
        },
      })

      const personnesAvecFormation = new Set(formations.map(formation => formation.personne_id))
      const aidantsEtMediateursFormes = personnesAvecFormation.size

      // Répartition par certification (pour les personnes en poste)
      const certificationCounts = new Map<string, number>()
      
      formations.forEach((formation: typeof formations[0]) => {
        // Traiter chaque formation pour catégoriser les certifications
        const certifications: Array<string> = []
        
        if (formation.label === 'CCP1') {certifications.push('CCP1')}
        if (formation.label === 'CCP2') {certifications.push('CCP2')}
        if (formation.label === 'CCP2 & CCP3') {certifications.push('CCP2 & CCP3')}
        if (formation.pix === true) {certifications.push('Pix')}
        if (formation.remn === true) {certifications.push('REMN')}
        
        // Si la formation a un label qui n'est pas CCP et pas de pix/remn
        if (formation.label !== null && 
            !['CCP1', 'CCP2', 'CCP2 & CCP3'].includes(formation.label) &&
            formation.pix !== true && 
            formation.remn !== true) {
          certifications.push('Autres')
        }
        
        // Incrémenter les compteurs pour chaque certification
        certifications.forEach(certification => {
          certificationCounts.set(certification, (certificationCounts.get(certification) ?? 0) + 1)
        })
      })

      const formationsFormatees = Array.from(certificationCounts.entries())
        .map(([nom, nombre]) => ({ nom, nombre }))
        .sort((premier, second) => second.nombre - premier.nombre)

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