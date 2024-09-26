export function assertTrue(assertion: boolean, exceptionReason: string): void | never {
  if (!assertion) {
    throw new AssertionException(exceptionReason)
  }
}

class AssertionException extends Error {
}
