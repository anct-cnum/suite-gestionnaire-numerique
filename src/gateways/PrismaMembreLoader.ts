import prisma from '../../prisma/prismaClient'

export class PrismaMembreLoader {
  async getDepartementCodeByStructureId(structureId: number): Promise<null | string> {
    const membre = await prisma.membreRecord.findFirst({
      select: {
        gouvernanceDepartementCode: true,
      },
      where: {
        statut: 'confirme',
        structureId,
      },
    })
    return membre?.gouvernanceDepartementCode ?? null
  }

  async getToutesAppartenancesParStructureId(
    structureId: number
  ): Promise<ReadonlyArray<Readonly<{ codeDepartement: string; estCoporteur: boolean }>>> {
    const membres = await prisma.membreRecord.findMany({
      select: {
        gouvernanceDepartementCode: true,
        isCoporteur: true,
      },
      where: {
        statut: 'confirme',
        structureId,
      },
    })

    return membres.map((membre) => ({
      codeDepartement: membre.gouvernanceDepartementCode,
      estCoporteur: membre.isCoporteur,
    }))
  }
}
