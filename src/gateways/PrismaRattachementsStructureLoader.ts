import prisma from '../../prisma/prismaClient'
import {
  RattachementsStructureLoader,
  RattachementsStructureReadModel,
} from '@/use-cases/queries/RecupererRattachementsStructure'

export class PrismaRattachementsStructureLoader implements RattachementsStructureLoader {
  async compter(structureId: number): Promise<RattachementsStructureReadModel> {
    const resultat = await prisma.main_structure_administrative.findUnique({
      select: {
        _count: {
          select: {
            contact_structures: true,
            contrat: true,
            membres: true,
            personne_affectations_emploi: true,
            poste: true,
            utilisateurs: true,
          },
        },
      },
      where: { id: structureId },
    })

    const compteurs = resultat?._count

    return {
      affectations: compteurs?.personne_affectations_emploi ?? 0,
      contacts: compteurs?.contact_structures ?? 0,
      contrats: compteurs?.contrat ?? 0,
      membres: compteurs?.membres ?? 0,
      postes: compteurs?.poste ?? 0,
      utilisateurs: compteurs?.utilisateurs ?? 0,
    }
  }
}
