export type Result<Failure, Success = ResultOk> = Failure | Success

export type ResultOk = 'OK'

export type Struct = Readonly<{
  [key: string]: JsonPrimitive | ReadonlyArray<JsonPrimitive | Struct> | Struct
}>

export function isOk(result: Result<unknown>): boolean {
  return result === 'OK'
}

export function isEmpty(s: string): boolean {
  return s === ''
}

export function isNullish(value: unknown): boolean {
  return value === undefined || value === null
}

export function isNullishOrEmpty(s: string | undefined | null): boolean {
  return isNullish(s) || isEmpty(s as string)
}

type JsonPrimitive = boolean | number | string
