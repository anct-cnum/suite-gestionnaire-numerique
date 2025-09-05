'use client'
import { ReactElement, useEffect, useState } from 'react'

export type SideMenuSection = Readonly<{
  id: string
  label: string
}>

export default function AidantDetailsSideMenu(props: Props): ReactElement {
  const { sections } = props
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? '')

  useEffect(() => {
    function handleScroll(): void {
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const { offsetHeight, offsetTop } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    return (): void => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [sections])

  function scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav
      aria-labelledby="fr-sidemenu-title"
      className="fr-sidemenu"
      role="navigation"
    >
      <div className="fr-sidemenu__inner">
        <button
          aria-controls="fr-sidemenu-wrapper"
          aria-expanded="false"
          className="fr-sidemenu__btn"
          type="button"
        >
          Sections
        </button>
        <div
          className="fr-collapse"
          id="fr-sidemenu-wrapper"
        >
          <ul className="fr-sidemenu__list">
            {sections.map((section) => (
              <li
                className="fr-sidemenu__item"
                key={section.id}
              >
                <button
                  aria-current={activeSection === section.id ? 'page' : undefined}
                  className={`fr-sidemenu__link ${
                    activeSection === section.id ? 'fr-sidemenu__link--active' : ''
                  }`}
                  onClick={() => { scrollToSection(section.id) }}
                  type="button"
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}

type Props = Readonly<{
  sections: ReadonlyArray<SideMenuSection>
}>
