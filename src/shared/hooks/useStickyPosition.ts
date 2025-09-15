'use client'
import { useEffect, useState } from 'react'

export type StickyPositionOptions = Readonly<{
  enabled?: boolean
  headerSelector?: string
}>

export default function useStickyPosition(options: StickyPositionOptions = {}): { topPosition: string } {
  const {
    enabled = true,
    headerSelector = 'header, .fr-header, [role="banner"]',
  } = options

  const [topPosition, setTopPosition] = useState<string>('30px')

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    function handleScrollAndResize(): void {
      const scrollPosition = window.scrollY
      const headerElement: HTMLElement | null = document.querySelector(headerSelector)
      const headerHeight = headerElement ? headerElement.offsetHeight : 200

      const newTopPosition = Math.max(0, headerHeight - scrollPosition)
      setTopPosition(`${newTopPosition}px`)
    }

    window.addEventListener('scroll', handleScrollAndResize)
    window.addEventListener('resize', handleScrollAndResize)
    handleScrollAndResize()

    return (): void => {
      window.removeEventListener('scroll', handleScrollAndResize)
      window.removeEventListener('resize', handleScrollAndResize)
    }
  }, [headerSelector, enabled])

  return {
    topPosition,
  }
}
