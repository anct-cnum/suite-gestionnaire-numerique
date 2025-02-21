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

// istanbul ignore next @preserve
export function noop(): void {
  // No-op
}

export function alphaAsc(): (left: string, right: string) => number
export function alphaAsc<K extends string, V extends Record<K, string>>(key: K): (left: V, right: V) => number
export function alphaAsc<K extends string, V extends Record<K, string>>(key?: K):
(left: string | V, right: string | V) => number {
  if (isNullish(key)) {
    return (left, right) => (left as string).localeCompare(right as string)
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (left, right) => (left as V)[key!].localeCompare((right as V)[key!])
}

type JsonPrimitive = boolean | number | string
