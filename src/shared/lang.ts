export type Result<Failure, Success = ResultOk> = Failure | Success

export type ResultOk = 'OK'

export type Struct = Readonly<{
  [key: string]: JsonPrimitive | ReadonlyArray<JsonPrimitive | Struct> | Struct
}>

export function isOk(result: Result<unknown>): boolean {
  return result === 'OK'
}

export function isEmpty(str: string): boolean {
  return str === ''
}

export function isNullish(value: unknown): boolean {
  return value === undefined || value === null
}

export function isNullishOrEmpty(str: string | undefined | null): boolean {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return isNullish(str) || isEmpty(str!)
}

export type UnaryOperator<T> = (element: T) => T

type JsonPrimitive = boolean | number | string
