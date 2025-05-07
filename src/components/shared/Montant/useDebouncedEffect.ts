import { useEffect } from 'react'

export function useDebouncedEffect<T>(
  effect: () => void,
  deps: Array<T>,
  delay: number
): void {
  useEffect(() => {
    const handler = setTimeout(() => {
      effect()
    }, delay)

    return (): void => { clearTimeout(handler) }
  }, [...deps, delay])
}
