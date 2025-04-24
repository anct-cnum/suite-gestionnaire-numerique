import { Action } from '@/domain/Action'

export interface AddActionRepository {
  add(action: Action): Promise<boolean>
}
