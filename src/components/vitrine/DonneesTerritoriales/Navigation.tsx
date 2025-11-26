'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ReactElement } from 'react'

import styles from './Navigation.module.css'
import useStickyPosition from '@/shared/hooks/useStickyPosition'

export default function Navigation(): ReactElement {
  const { topPosition } = useStickyPosition({
    enabled: true,
    headerSelectors: ['.fr-header', '[data-donnees-territoriales-header]'],
  })
  const pathname = usePathname()
  const params = useParams()

  const pathParts = pathname.split('/').filter(Boolean)
  const currentSection = pathParts[2] || 'synthese-et-indicateurs'

  // Extraire niveau et code depuis params
  const niveau = currentSection === 'gouvernances'
    ? pathParts[3] // 'departement' pour gouvernances
    : (params.niveau as string | undefined)

  const codeArray = params.code as ReadonlyArray<string> | undefined
  const code = codeArray?.[0]

  const territoirePath = getTerritoirePath(niveau, code)

  const allSections = [
    {
      href: `/vitrine/donnees-territoriales/synthese-et-indicateurs${territoirePath}`,
      label: 'Synthèse et indicateurs',
    },
    {
      href: `/vitrine/donnees-territoriales/lieux-inclusion${territoirePath}`,
      label: 'Lieux d\'inclusion',
    },
    {
      href: `/vitrine/donnees-territoriales/mediateurs-numeriques${territoirePath}`,
      label: 'Médiateurs numériques',
    },
    {
      href: `/vitrine/donnees-territoriales/gouvernances${territoirePath}`,
      label: 'Gouvernances',
      onlyDepartement: true,
    },
    {
      href: `/vitrine/donnees-territoriales/feuille-de-route${territoirePath}`,
      label: 'Feuille de route',
      onlyDepartement: true,
    },
  ]

  // Filtrer les sections : afficher "Feuille de route" uniquement au niveau département
  const sections = allSections.filter((section) => {
    if ('onlyDepartement' in section && section.onlyDepartement === true) {
      return niveau === 'departement'
    }
    return true
  })

  return (
    <nav
      aria-labelledby="donnees-territoriales-menu"
      className={`fr-sidemenu ${styles.navigationFixed}`}
      role="navigation"
      style={{
        boxShadow: 'none',
        gap: '56px',
        height: '384px',
        opacity: 1,
        paddingBottom: 'var(--spacing-10v, 2.5rem)',
        paddingLeft: 'var(--spacing-20v, 5rem)',
        paddingRight: 'var(--spacing-0v, 0)',
        paddingTop: 'var(--spacing-10v, 2.5rem)',
        top: topPosition,
        width: '320px',
      }}
    >
      <div
        className="fr-sidemenu__inner"
        style={{ boxShadow: 'none' }}
      >
        <button
          aria-controls="donnees-territoriales-menu-wrapper"
          aria-expanded="false"
          className="fr-sidemenu__btn"
          type="button"
        >
          Navigation
        </button>
        <div
          className="fr-collapse"
          id="donnees-territoriales-menu-wrapper"
        >
          <ul className="fr-sidemenu__list">
            {sections.map((section) => {
              const isActive = pathname.startsWith(section.href)

              return (
                <li
                  className="fr-sidemenu__item"
                  key={section.href}
                >
                  <div className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}>
                    <Link
                      aria-current={isActive ? 'page' : undefined}
                      className={`${styles.menuItemLink} ${isActive ? styles.menuItemLinkActive : ''}`}
                      href={section.href}
                    >
                      {section.label}
                    </Link>
                  </div>
                </li>
              )
            })}
            {/*<li className="fr-sidemenu__item fr-mt-4w">*/}
            {/*  <Link*/}
            {/*    className={styles.buttonAccess}*/}
            {/*    href="#"*/}
            {/*  >*/}
            {/*    <span*/}
            {/*      aria-hidden="true"*/}
            {/*      className={styles.buttonAccessIcon}*/}
            {/*    >*/}
            {/*      <span className="fr-icon-external-link-line" />*/}
            {/*    </span>*/}
            {/*    <span className={styles.buttonAccessText}>*/}
            {/*      Accéder aux données*/}
            {/*    </span>*/}
            {/*  </Link>*/}
            {/*</li>*/}
          </ul>
        </div>
      </div>
    </nav>
  )
}

function getTerritoirePath(niveau?: string, code?: string): string {
  if (niveau === undefined || niveau === '' || code === undefined) {
    return '/national'
  }

  if (niveau === 'region') {
    return `/region/${code}`
  }

  if (niveau === 'departement') {
    return `/departement/${code}`
  }

  return '/national'
}
