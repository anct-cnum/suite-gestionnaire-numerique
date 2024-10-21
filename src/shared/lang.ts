export type Result<Failure, Success = ResultOk> = Failure | Success

export type ResultOk = 'OK'

export type Struct = Readonly<{
  [key: string]:
    | JsonPrimitive
    | ReadonlyArray<JsonPrimitive | Struct>
    | Struct
}>

type JsonPrimitive = boolean | number | string
