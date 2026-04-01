'use client'
import { useEffect, useState } from 'react'

export default function useStickyPosition(options: StickyPositionOptions = {}): Readonly<{
  maxHeight: string
  topPosition: string
}> {
  const { enabled = true, footerSelector = '.fr-footer', headerSelectors = ['.fr-header'] } = options

  const [topPosition, setTopPosition] = useState('30px')
  const [maxHeight, setMaxHeight] = useState('none')

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

      const footer: HTMLElement | null = document.querySelector(footerSelector)
      if (footer !== null) {
        const footerTop = footer.getBoundingClientRect().top
        const availableHeight = footerTop - newTopPosition
        if (availableHeight < window.innerHeight - newTopPosition) {
          setMaxHeight(`${Math.max(0, availableHeight)}px`)
        } else {
          setMaxHeight('none')
        }
      }
    }

    window.addEventListener('scroll', handleScrollAndResize)
    window.addEventListener('resize', handleScrollAndResize)
    handleScrollAndResize()

    return (): void => {
      window.removeEventListener('scroll', handleScrollAndResize)
      window.removeEventListener('resize', handleScrollAndResize)
    }
  }, [headerSelectors, footerSelector, enabled])

  return {
    maxHeight,
    topPosition,
  }
}

type StickyPositionOptions = Readonly<{
  enabled?: boolean
  footerSelector?: string
  headerSelectors?: ReadonlyArray<string>
}>
