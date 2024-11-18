// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<Params extends Array<any>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  func: (...args: Params) => any,
  timeout = 300
): (...args: Params) => void {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let timer: NodeJS.Timeout
  return (...args: Params) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func(...args)
    }, timeout)
  }
}
