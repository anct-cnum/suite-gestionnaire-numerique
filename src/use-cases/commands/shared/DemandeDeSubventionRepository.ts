import { Prisma } from '@prisma/client'

import { DemandeDeSubvention } from '@/domain/DemandeDeSubvention'

export interface AddDemandeDeSubventionRepository {
  add(demandeDeSubvention: DemandeDeSubvention, tx?: Prisma.TransactionClient): Promise<boolean>
}

export interface GetDemandeDeSubventionRepository {
  get(uid: DemandeDeSubvention['uid']['state']['value']): Promise<DemandeDeSubvention>
}

export interface DropDemandeDeSubventionRepository {
  drop(uidAction: DemandeDeSubvention['state']['uidAction']): Promise<boolean>
}
