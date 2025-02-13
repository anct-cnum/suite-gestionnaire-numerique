'use client'

import Link from 'next/link'
import { ReactElement, useContext } from 'react'

import styles from './MenuLateral.module.css'
import { clientContext } from '@/components/shared/ClientContext'

export function SousMenuGouvernance({
  isAfficherSousMenuFeuilleDeRoute, isAfficherSousMenuMembre,
}: Props):
  ReactElement {
  const { pathname, sessionUtilisateurViewModel } = useContext(clientContext)

  const sousMenus = [
    {
      label: 'Membres',
      url: `/gouvernance/${sessionUtilisateurViewModel.codeDepartement}/membres`,
      visible: isAfficherSousMenuMembre,
    },
    {
      label: 'Feuilles de route',
      url: `/gouvernance/${sessionUtilisateurViewModel.codeDepartement}/feuilles-de-routes`,
      visible: isAfficherSousMenuFeuilleDeRoute,
    },
  ]

  const sousMenuElements = sousMenus.filter((sousMenu) => sousMenu.visible)

  return (
    <div
      className="fr-collapse"
      id="fr-sidemenu-gouvernance"
    >
      <ul className="fr-sidemenu__list">
        {sousMenuElements.map((sousMenuElement) => {
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

type Props = Readonly<{
  isAfficherSousMenuFeuilleDeRoute: boolean
  isAfficherSousMenuMembre: boolean
}>
