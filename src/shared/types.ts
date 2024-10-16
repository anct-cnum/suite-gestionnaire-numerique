export type Struct = Readonly<{
  [key: string]:
    | JsonPrimitive
    | ReadonlyArray<JsonPrimitive | Struct>
    | Struct
}>

type JsonPrimitive = boolean | number | string
