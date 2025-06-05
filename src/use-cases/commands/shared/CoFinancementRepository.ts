import { Prisma } from '@prisma/client'

import { CoFinancement } from '@/domain/CoFinancement'

export interface AddCoFinancementRepository {
  add(coFinancement: CoFinancement, tx?: Prisma.TransactionClient): Promise<boolean>
}

export interface GetCoFinancementRepository {
  get(uidAction: string, tx?: Prisma.TransactionClient): Promise<Array<CoFinancement>>
}

export interface UpdateCoFinancementRepository {
  update(coFinancement: CoFinancement, tx?: Prisma.TransactionClient): Promise<boolean>
}

export interface SupprimerCoFinancementRepository {
  supprimer(uidAction: string, tx?: Prisma.TransactionClient): Promise<boolean>
}
