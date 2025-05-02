import { Prisma } from '@prisma/client'

import { RecordId } from './Repository'
import { Action } from '@/domain/Action'

export interface GetActionRepository {
  get(uid: Action['uid']['state']['value']): Promise<Action>
}
export interface AddActionRepository {
  add(action: Action, tx?: Prisma.TransactionClient): Promise<RecordId>
}
