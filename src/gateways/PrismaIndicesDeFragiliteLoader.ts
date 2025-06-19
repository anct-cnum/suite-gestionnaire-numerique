
import { Decimal } from '@prisma/client/runtime/library'

import prisma from '../../prisma/prismaClient'
import { IndicesDeFragiliteLoader, IndicesDeFragiliteReadModel } from '@/use-cases/queries/RecupererMesIndicesDeFragilite'

export class PrismaIndicesDeFragiliteLoader implements IndicesDeFragiliteLoader {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async get(codeDepartement: string): Promise<IndicesDeFragiliteReadModel> {
    const communes = await prisma.ifnCommune.findMany({
      select: {
        codeInsee: true,
        score: true,
      },
      where: {
        codeInsee: {
          startsWith: codeDepartement,
        },
      },
    })
    return {
      communes: communes.map((commune: { codeInsee: string; score: Decimal | null }) => ({
        codeInsee: commune.codeInsee,
        score: commune.score ? Number(commune.score) : null,
      })),
      departement: codeDepartement,
    }
  }
}
