import { Struct } from '@/shared/lang'

export interface QueryHandler<Query extends Struct, ReadModel> {
  get(query: Query): Promise<ReadModel>
}
