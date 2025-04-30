import { Prisma } from '@prisma/client'

import { MembreConfirme } from '@/domain/MembreConfirme'

export interface MembreDepartementRepository {
  add(membreId: string, departementCode: string, role: string, tx?: Prisma.TransactionClient): Promise<boolean>
  get(membreId: string, departementCode: string, tx?: Prisma.TransactionClient): Promise<MembreConfirme | null>
}
