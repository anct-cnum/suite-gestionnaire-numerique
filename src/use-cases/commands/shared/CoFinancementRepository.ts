import { Prisma } from '@prisma/client'

import { CoFinancement } from '@/domain/CoFinancement'

export interface AddCoFinancementRepository {
  add(coFinancement: CoFinancement, tx?: Prisma.TransactionClient): Promise<boolean>
}
