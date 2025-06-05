import { Prisma } from '@prisma/client'

import { DemandeDeSubvention } from '@/domain/DemandeDeSubvention'

export interface AddDemandeDeSubventionRepository {
  add(demandeDeSubvention: DemandeDeSubvention, tx?: Prisma.TransactionClient): Promise<boolean>
}

export interface GetDemandeDeSubventionRepository {
  get(uid: DemandeDeSubvention['uid']['state']['value']): Promise<DemandeDeSubvention>
}

export interface UpdateDemandeDeSubventionRepository {
  update(demandeDeSubvention: DemandeDeSubvention, tx?: Prisma.TransactionClient): Promise<boolean>
}

export interface SupprimerDemandeDeSubventionRepository {
  supprimer(uid: DemandeDeSubvention['uid']['state']['value'], tx?: Prisma.TransactionClient): Promise<boolean>
}
