import { Prisma } from '@prisma/client'

import { journaliserTransaction } from './shared/journalisationMin'
import prisma from '../../prisma/prismaClient'
import { TransactionRepository } from '@/use-cases/commands/shared/TransactionRepository'

export class PrismaTransactionRepository implements TransactionRepository {
  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return journaliserTransaction(prisma, fn)
  }
}
