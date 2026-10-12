import { conditionLieuDeLaStructure } from './shared/lieuxDansScope'
import prisma from '../../prisma/prismaClient'

// « Lieu de ma structure » pour les droits de modification : même définition que le listing
// (conditionLieuDeLaStructure), tous les employeurs du lieu compris (#2092).
export class PrismaLieuxDeLaStructureLoader {
  async estLieuDeLaStructure(lieuId: number, structureId: number): Promise<boolean> {
    const lieux = await prisma.$queryRaw<ReadonlyArray<Readonly<{ id: number }>>>`
      SELECT l.id FROM main.lieu_inclusion l
      WHERE l.id = ${lieuId} AND ${conditionLieuDeLaStructure(structureId)}
    `
    return lieux.length > 0
  }
}
