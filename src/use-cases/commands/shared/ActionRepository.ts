import { Prisma } from '@prisma/client'

import { RecordId } from './Repository'
import { Action, ActionUid } from '@/domain/Action'
import { DemandeDeSubventionUid } from '@/domain/DemandeDeSubvention'

export interface GetActionRepository {
  get(uid: Action['uid']['state']['value']): Promise<Action>
}
export interface AddActionRepository {
  add(action: Action, tx?: Prisma.TransactionClient): Promise<RecordId>
}
export interface SupprimerActionRepository {
  supprimer(actionId: ActionUid, demandeDeSubventionId: DemandeDeSubventionUid,
    tx?: Prisma.TransactionClient): Promise<boolean>
}
