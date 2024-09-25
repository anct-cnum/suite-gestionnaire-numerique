export interface QueryHandler<Query, ReadModel> {
  get: (query: Query) => Promise<ReadModel>
}
