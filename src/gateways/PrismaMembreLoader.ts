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
}
