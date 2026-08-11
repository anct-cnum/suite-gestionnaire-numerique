import prisma from '../../prisma/prismaClient'
import { StructurePrefectureDuDepartementLoader } from '@/use-cases/commands/InviterUnUtilisateur'
import { MembreExistantLoader } from '@/use-cases/commands/RejoindreUneGouvernance'

export class PrismaMembreLoader implements MembreExistantLoader, StructurePrefectureDuDepartementLoader {
  async existePourStructureDansGouvernance(structureId: number, codeDepartement: string): Promise<boolean> {
    const membre = await prisma.membreRecord.findFirst({
      select: {
        id: true,
      },
      where: {
        gouvernanceDepartementCode: codeDepartement,
        structureId,
      },
    })

    return membre !== null
  }

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

  async structurePrefectureDuDepartement(codeDepartement: string): Promise<null | number> {
    // Convention d'identifiant des membres de gouvernance : 'prefecture-<dept>' est la préfecture
    // du département. Un membre supprimé de la gouvernance reste une référence valide.
    const membre = await prisma.membreRecord.findUnique({
      select: {
        structureId: true,
      },
      where: {
        id: `prefecture-${codeDepartement}`,
      },
    })

    return membre?.structureId ?? null
  }
}
