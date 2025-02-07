'use client'

import Link from 'next/link'
import { ReactElement, useContext } from 'react'

import styles from './MenuLateral.module.css'
import { clientContext } from '@/components/shared/ClientContext'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

interface SousMenuGouvernanceProps {
  readonly codeDepartement: string
  readonly gouvernanceViewModel: GouvernanceViewModel
}

export function SousMenuGouvernance({ codeDepartement, gouvernanceViewModel }: SousMenuGouvernanceProps):
ReactElement | null {
  const { pathname } = useContext(clientContext)

  const sousMenu = [
    ...Number(gouvernanceViewModel.sectionCoporteurs.total) > 0
      ? [{ label: 'Membres', url: `/gouvernance/${codeDepartement}/membres` }]
      : [],
    ...Number(gouvernanceViewModel.sectionFeuillesDeRoute.total) > 0
      ? [{ label: 'Feuilles de route', url: `/gouvernance/${codeDepartement}/feuilles-de-routes` }]
      : [],
  ]

  if (sousMenu.length === 0) {
    return null
  }

  return (
    <div
      className="fr-collapse"
      id="fr-sidemenu-gouvernance"
    >
      <ul className="fr-sidemenu__list">
        {sousMenu.map((sousMenuElement) => {
          const activeClass = pathname === sousMenuElement.url ? `fr-sidemenu__item--active ${styles['element-selectionne']}` : ''

          return (
            <li
              className={`fr-sidemenu__item ${activeClass}`}
              key={sousMenuElement.url}
            >
              <Link
                aria-current={pathname === sousMenuElement.url ? 'page' : false}
                className="fr-sidemenu__link"
                href={sousMenuElement.url}
              >
                {sousMenuElement.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
