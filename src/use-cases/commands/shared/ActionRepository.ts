import { Prisma } from '@prisma/client'

import { Action } from '@/domain/Action'

export interface GetActionRepository {
  get(uid: Action['uid']['state']['value']): Promise<Action>
}
export interface AddActionRepository {
  add(action: Action, tx?: Prisma.TransactionClient): Promise<boolean>
}

export interface DropActionRepository {
  drop(action: Action): Promise<boolean>
}
