import { Struct } from '@/shared/lang'

export interface QueryHandler<Query extends Struct, ReadModel> {
  handle(query: Query): Promise<ReadModel>
}
