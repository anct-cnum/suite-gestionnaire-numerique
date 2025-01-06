// eslint-disable-next-line unused-imports/no-unused-imports, @typescript-eslint/no-unused-vars
import type { Assertion } from 'vitest'

interface CustomMatchers<R = unknown> {
  toOpenInNewTab(content: string): R
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T> extends CustomMatchers<T> {}
}
