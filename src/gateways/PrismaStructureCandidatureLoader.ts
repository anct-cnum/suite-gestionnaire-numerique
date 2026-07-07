import prisma from '../../prisma/prismaClient'
import { StructureCandidature, StructureCandidatureLoader } from '@/use-cases/commands/RejoindreUneGouvernance'

export class PrismaStructureCandidatureLoader implements StructureCandidatureLoader {
  readonly #structureDataResource = prisma.main_structure_administrative

  async get(structureId: number): Promise<StructureCandidature> {
    const structure = await this.#structureDataResource.findUniqueOrThrow({
      include: {
        categories_juridiques: true,
      },
      where: {
        id: structureId,
      },
    })

    return {
      categorieJuridiqueCode: structure.categorie_juridique ?? '',
      categorieJuridiqueLibelle: structure.categories_juridiques?.nom ?? '',
      nom: structure.denomination_antenne ?? structure.denomination_sirene ?? '',
      siret: structure.siret ?? structure.ridet ?? '',
    }
  }
}
