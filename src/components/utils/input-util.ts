export const debounce = (
  func: (query: string, maFonctionAApeller: () => void) => Promise<void>,
  delay: number
) => {
  let timeoutId = 0

  // eslint-disable-next-line max-len
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
  return (...args: [query: string, maFonctionAApeller: () => void]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(
      () => {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-invalid-this
        void func.apply(this, args)
      },
      delay,
      []
    )
  }
}
