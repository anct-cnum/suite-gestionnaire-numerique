'use client'
import { useEffect, useState } from 'react'

export type StickyPositionOptions = Readonly<{
  enabled?: boolean
  headerSelectors?: ReadonlyArray<string>
}>

export default function useStickyPosition(options: StickyPositionOptions = {}): { topPosition: string } {
  const {
    enabled = true,
    headerSelectors = ['.fr-header'],
  } = options

  const [topPosition, setTopPosition] = useState<string>('30px')

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    function handleScrollAndResize(): void {
      const scrollPosition = window.scrollY

      const totalHeaderHeight = headerSelectors.reduce((total, selector) => {
        const element: HTMLElement | null = document.querySelector(selector)
        return total + (element ? element.offsetHeight : 0)
      }, 0)

      const newTopPosition = Math.max(0, totalHeaderHeight - scrollPosition) + 40
      setTopPosition(`${newTopPosition}px`)
    }

    window.addEventListener('scroll', handleScrollAndResize)
    window.addEventListener('resize', handleScrollAndResize)
    handleScrollAndResize()

    return (): void => {
      window.removeEventListener('scroll', handleScrollAndResize)
      window.removeEventListener('resize', handleScrollAndResize)
    }
  }, [headerSelectors, enabled])

  return {
    topPosition,
  }
}
