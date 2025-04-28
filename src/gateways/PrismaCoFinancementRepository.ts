import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { CoFinancement } from '@/domain/CoFinancement'
import { AddCoFinancementRepository } from '@/use-cases/commands/shared/CoFinancementRepository'

export class PrismaCoFinancementRepository implements AddCoFinancementRepository {
  readonly #dataResource = prisma.coFinancementRecord

  async add(coFinancement: CoFinancement, tx?: Prisma.TransactionClient): Promise<boolean> {
    const client = tx ?? prisma

    await client.coFinancementRecord.create({
      data: {
        actionId: Number(coFinancement.state.uidAction),
        memberId: coFinancement.state.uidMembre,
        montant: coFinancement.state.montant,
      },
    })

    return true
  }
}
