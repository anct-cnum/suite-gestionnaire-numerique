import { Prisma } from '@prisma/client'

export interface TransactionRepository {
  transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>
} 