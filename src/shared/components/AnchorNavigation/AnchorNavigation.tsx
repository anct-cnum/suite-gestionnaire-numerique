'use client'
import { CSSProperties, ReactElement } from 'react'

import styles from './AnchorNavigation.module.css'
import useAnchorNavigation, { type AnchorNavigationOptions, type AnchorSection } from '../../hooks/useAnchorNavigation'
import useStickyPosition, { type StickyPositionOptions } from '../../hooks/useStickyPosition'

export default function AnchorNavigation(props: AnchorNavigationProps): ReactElement {
  const {
    className = '',
    enabled = true,
    headerSelector,
    offset,
    scrollBehavior,
    sections,
    sticky = false,
    style = {},
    title = 'Sections',
    updateUrl,
  } = props

  const anchorNavigation = useAnchorNavigation({
    headerSelector,
    offset,
    scrollBehavior,
    sections,
    updateUrl,
  })
  const { activeSection } = anchorNavigation

  const { topPosition } = useStickyPosition({
    enabled: sticky && enabled,
    headerSelector,
  })

  const navStyle = sticky
    ? { ...style, boxShadow: 'none', top: topPosition }
    : style

  const navClassName = sticky
    ? `fr-sidemenu ${styles.sideMenuFixed} ${className}`
    : `fr-sidemenu ${className}`

  return (
    <nav
      aria-labelledby="fr-sidemenu-title"
      className={navClassName}
      role="navigation"
      style={navStyle}
    >
      <div
        className="fr-sidemenu__inner"
        style={sticky ? { boxShadow: 'none' } : {}}
      >
        <button
          aria-controls="fr-sidemenu-wrapper"
          aria-expanded="false"
          className="fr-sidemenu__btn"
          type="button"
        >
          {title}
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
                  onClick={(): void => {
                    anchorNavigation.scrollToSection(section.id)
                  }}
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

type AnchorNavigationProps = AnchorNavigationOptions & Readonly<{
  className?: string
  sticky?: boolean
  style?: CSSProperties
  title?: string
}> & StickyPositionOptions

export type { AnchorSection }
