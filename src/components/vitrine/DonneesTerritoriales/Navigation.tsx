'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ReactElement } from 'react'

import styles from './Navigation.module.css'
import { etatCourant } from '../navigation/etatCourant'
import useStickyPosition from '@/shared/hooks/useStickyPosition'

export default function Navigation(): ReactElement {
  const { topPosition } = useStickyPosition({
    enabled: true,
    headerSelectors: ['.fr-header', '[data-donnees-territoriales-header]'],
  })
  const pathname = usePathname()
  const params = useParams()

  // Extraire niveau et code depuis params
  const niveau = params.niveau as string | undefined

  const codeArray = params.code as ReadonlyArray<string> | undefined
  const code = codeArray?.[0]

  const territoirePath = getTerritoirePath(niveau, code)

  const allSections = [
    {
      href: `/donnees-territoriales/synthese-et-indicateurs${territoirePath}`,
      label: 'Synthèse et indicateurs',
    },
    {
      href: `/donnees-territoriales/lieux-inclusion${territoirePath}`,
      label: "Lieux d'inclusion",
    },
    {
      href: `/donnees-territoriales/mediateurs-numeriques${territoirePath}`,
      label: 'Médiateurs numériques',
    },
    {
      href: `/donnees-territoriales/gouvernances${territoirePath}`,
      label: 'Gouvernances',
      niveaux: ['departement', 'epci'],
    },
    {
      href: `/donnees-territoriales/feuille-de-route${territoirePath}`,
      label: 'Feuille de route',
      niveaux: ['departement'],
    },
  ]

  // Filtrer les sections : certaines ne sont disponibles qu'à certains niveaux territoriaux
  const sections = allSections.filter((section) => {
    if (section.niveaux === undefined) {
      return true
    }
    return niveau !== undefined && section.niveaux.includes(niveau)
  })

  return (
    <nav
      aria-label="Rubriques des données territoriales"
      className={`fr-sidemenu ${styles.navigationFixed}`}
      style={{ top: topPosition }}
    >
      <div className="fr-sidemenu__inner">
        <button
          aria-controls="donnees-territoriales-menu-wrapper"
          aria-expanded="false"
          className="fr-sidemenu__btn"
          type="button"
        >
          Consulter les données
        </button>
        <div className="fr-collapse" id="donnees-territoriales-menu-wrapper">
          <ul className="fr-sidemenu__list">
            {sections.map((section) => {
              const etat = etatCourant(pathname, section.href)

              return (
                <li
                  className={`fr-sidemenu__item${etat === undefined ? '' : ' fr-sidemenu__item--active'}`}
                  key={section.href}
                >
                  <Link aria-current={etat} className="fr-sidemenu__link" href={section.href}>
                    {section.label}
                  </Link>
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

  if (niveau === 'epci') {
    return `/epci/${code}`
  }

  return '/national'
}
