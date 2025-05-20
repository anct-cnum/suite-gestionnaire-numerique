import { Prisma } from '@prisma/client'

import { DemandeDeSubvention } from '@/domain/DemandeDeSubvention'
import { ActionUid } from '@/domain/Action'

export interface AddDemandeDeSubventionRepository {
  add(demandeDeSubvention: DemandeDeSubvention, tx?: Prisma.TransactionClient): Promise<boolean>
}

export interface GetDemandeDeSubventionRepository {
  get(actionId: ActionUid, tx?: Prisma.TransactionClient): Promise<DemandeDeSubvention>
}
