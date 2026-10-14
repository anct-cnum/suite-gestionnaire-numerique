import prisma from '../../prisma/prismaClient'
import {
  GouvernanceStructureLoader,
  GouvernanceStructureReadModel,
  UneGouvernanceStructureReadModel,
} from '@/use-cases/queries/shared/GouvernanceStructureReadModel'

export class PrismaGouvernanceStructureLoader implements GouvernanceStructureLoader {
  async recupererGouvernanceDesStructures(structureIds: ReadonlyArray<number>): Promise<GouvernanceStructureReadModel> {
    const structures = await prisma.main_structure_administrative.findMany({
      include: {
        membres: {
          select: {
            isCoporteur: true,
            relationGouvernance: {
              select: {
                relationDepartement: {
                  select: {
                    nom: true,
                  },
                },
              },
            },
            statut: true,
          },
          where: {
            statut: {
              in: statutsMembreExportes,
            },
          },
        },
      },
      where: {
        id: { in: [...structureIds] },
        membres: {
          some: {
            statut: {
              in: statutsMembreExportes,
            },
          },
        },
      },
    })

    const gouvernanceParStructure = new Map<number, UneGouvernanceStructureReadModel>()
    for (const structure of structures) {
      const membresConfirmes = structure.membres.filter((membre) => membre.statut === 'confirme')
      // Une structure à la fois validée et candidate (plusieurs gouvernances) compte comme validée
      const membres = membresConfirmes.length > 0 ? membresConfirmes : structure.membres
      gouvernanceParStructure.set(structure.id, {
        roleGouvernance: membres.some((membre) => membre.isCoporteur) ? 'coporteur' : 'membre',
        siret: structure.siret ?? '',
        statutStructure: membresConfirmes.length > 0 ? 'validée' : 'candidate',
        territoires: [...new Set(membres.map((membre) => membre.relationGouvernance.relationDepartement.nom))],
      })
    }

    return gouvernanceParStructure
  }
}

const statutsMembreExportes = ['candidat', 'confirme']
