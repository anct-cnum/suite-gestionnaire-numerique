import { Prisma } from '@prisma/client'

import { DemandeDeSubvention } from '@/domain/DemandeDeSubvention'

export interface AddDemandeDeSubventionRepository {
  add(demandeDeSubvention: DemandeDeSubvention, tx?: Prisma.TransactionClient): Promise<boolean>
}
