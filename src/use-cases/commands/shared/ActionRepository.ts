import { Action } from '@/domain/Action'

export interface AddActionRepository {
  add(action: Action): Promise<boolean>
}

export interface GetActionRepository {
  get(action: Action['uid']): Promise<Action>
}

export interface DropActionRepository {
  drop(action: Action): Promise<boolean>
}
