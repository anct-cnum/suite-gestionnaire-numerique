import { Prisma } from '../../../../prisma/generated/client'

export interface TransactionRepository {
  transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>
}
