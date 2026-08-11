import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import { NiveauDeFormationLoader, NiveauDeFormationReadModel } from '@/use-cases/queries/RecupererNiveauDeFormation'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaNiveauDeFormationLoader implements NiveauDeFormationLoader {
  async get(territoire = 'France'): Promise<ErrorReadModel | NiveauDeFormationReadModel> {
    try {
      // Récupérer toutes les personnes en poste avec leurs structures employeuses
      const personnesEnPoste = await prisma.personneEnrichieView.findMany({
        select: {
          id: true,
          structure_employeuse_id: true,
        },
        where: {
          OR: [{ est_actuellement_mediateur_en_poste: true }, { est_actuellement_aidant_numerique_en_poste: true }],
        },
      })

      // Si on filtre par territoire, récupérer les départements des structures
      let personnesIds = personnesEnPoste.map((personne) => personne.id)

      if (territoire !== 'France') {
        const structureIds = [
          ...new Set(
            personnesEnPoste
              .filter(
                (personne): personne is { structure_employeuse_id: number } & typeof personne =>
                  personne.structure_employeuse_id !== null
              )
              .map((personne) => personne.structure_employeuse_id)
          ),
        ]

        // Refonte 2026 : structure_employeuse_id pointe sur SA (V092).
        const structures = await prisma.main_structure_administrative.findMany({
          select: { id: true },
          where: {
            adresse: {
              departement: territoire,
            },
            id: { in: structureIds },
          },
        })

        const structuresInTerritoire = new Set(structures.map((structure) => structure.id))

        personnesIds = personnesEnPoste
          .filter(
            (personne): personne is { structure_employeuse_id: number } & typeof personne =>
              personne.structure_employeuse_id !== null && structuresInTerritoire.has(personne.structure_employeuse_id)
          )
          .map((personne) => personne.id)
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
          OR: [{ label: { not: null } }, { remn: true }, { pix: true }],
          personne_id: { in: personnesIds },
        },
      })

      const personnesAvecFormation = new Set(formations.map((formation) => formation.personne_id))
      const aidantsEtMediateursFormes = personnesAvecFormation.size

      // Répartition par certification (pour les personnes en poste)
      const certificationCounts = new Map<string, number>()

      for (const formation of formations) {
        for (const certification of categoriserCertifications(formation)) {
          certificationCounts.set(certification, (certificationCounts.get(certification) ?? 0) + 1)
        }
      }

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

type FormationRecord = Readonly<{
  label: null | string
  personne_id: number
  pix: boolean | null
  remn: boolean | null
}>

const labelREMN = ['CCP2', 'CCP2 & CCP3']

function categoriserCertifications(formation: FormationRecord): Array<string> {
  const estREMN = formation.remn === true || (formation.label !== null && labelREMN.includes(formation.label))
  const estCCP1 = !estREMN && formation.label === 'CCP1'
  const estPix = formation.pix === true

  const certifications: Array<string> = []
  if (estREMN) {
    certifications.push('REMN')
  }
  if (estCCP1) {
    certifications.push('CCP1')
  }
  if (estPix) {
    certifications.push('PIX')
  }

  return certifications
}
