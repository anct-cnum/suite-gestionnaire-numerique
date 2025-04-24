import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { TransactionRepository } from '@/use-cases/commands/shared/TransactionRepository'

export class PrismaTransactionRepository implements TransactionRepository {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn)
  }
} 