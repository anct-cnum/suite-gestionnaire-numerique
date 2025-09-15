'use client'
import { useCallback, useEffect, useState } from 'react'

export type AnchorSection = Readonly<{
  id: string
  label: string
}>

export type AnchorNavigationOptions = Readonly<{
  headerSelector?: string
  offset?: number
  scrollBehavior?: ScrollBehavior
  sections: ReadonlyArray<AnchorSection>
  updateUrl?: boolean
}>

export default function useAnchorNavigation(options: AnchorNavigationOptions): {
  activeSection: string
  scrollToSection(sectionId: string, behavior?: ScrollBehavior): void
} {
  const {
    headerSelector = 'header, .fr-header, [role="banner"]',
    offset = 20,
    scrollBehavior = 'smooth',
    sections,
    updateUrl = true,
  } = options

  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? '')

  const scrollToSection = useCallback((sectionId: string, behavior: ScrollBehavior = scrollBehavior): void => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerElement: HTMLElement | null = document.querySelector(headerSelector)
      const headerHeight = headerElement ? headerElement.offsetHeight : 200
      const elementPosition = element.offsetTop - headerHeight - offset

      window.scrollTo({ behavior, top: elementPosition })

      if (updateUrl) {
        const newUrl = `${window.location.pathname}${window.location.search}#${sectionId}`
        if (behavior === 'instant') {
          window.history.replaceState(null, '', newUrl)
        } else {
          window.history.pushState(null, '', newUrl)
        }
      }

      setActiveSection(sectionId)
    }
  }, [headerSelector, offset, scrollBehavior, updateUrl])

  // Scroll automatique vers l'ancre au chargement
  useEffect(() => {
    function scrollToHashOnLoad(): void {
      const hash = window.location.hash.replace('#', '')
      if (hash && sections.some(section => section.id === hash)) {
        setTimeout(() => {
          scrollToSection(hash, 'instant')
        }, 100)
      }
    }

    scrollToHashOnLoad()
  }, [sections, scrollToSection])

  // Détection de la section active pendant le scroll
  useEffect(() => {
    function handleScroll(): void {
      const scrollPosition = window.scrollY
      const headerElement: HTMLElement | null = document.querySelector(headerSelector)
      const headerHeight = headerElement ? headerElement.offsetHeight : 200

      let currentActiveSection = sections[0]?.id ?? ''

      for (let index = 0; index < sections.length; index += 1) {
        const section = sections[index]
        const element = document.getElementById(section.id)

        if (element) {
          const rect = element.getBoundingClientRect()
          const sectionTop = rect.top + scrollPosition
          const sectionBottom = sectionTop + rect.height
          const viewportMiddle = scrollPosition + headerHeight + 100

          if (viewportMiddle >= sectionTop && viewportMiddle < sectionBottom) {
            currentActiveSection = section.id
            break
          }

          if (index === sections.length - 1 && viewportMiddle >= sectionTop) {
            currentActiveSection = section.id
          }
        }
      }

      if (currentActiveSection !== activeSection) {
        setActiveSection(currentActiveSection)

        if (updateUrl) {
          const newUrl = `${window.location.pathname}${window.location.search}#${currentActiveSection}`
          window.history.replaceState(null, '', newUrl)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return (): void => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [sections, activeSection, headerSelector, updateUrl])

  return {
    activeSection,
    scrollToSection,
  }
}
