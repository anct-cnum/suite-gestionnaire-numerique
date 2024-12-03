'use client'

import Link from 'next/link'
import { ReactElement, useContext } from 'react'

import { clientContext } from '@/components/shared/ClientContext'

export default function MenuLateral(): ReactElement {
  const { sessionUtilisateurViewModel } = useContext(clientContext)

  return (
    <nav
      aria-labelledby="fr-sidemenu-title"
      className="fr-sidemenu fr-pt-5w"
    >
      <div
        className="fr-sidemenu__title fr-hidden"
        id="fr-sidemenu-title"
      >
        Menu inclusion numérique
      </div>
      <ul className="fr-sidemenu__list">
        <li className="fr-sidemenu__item">
          <Link
            className="fr-sidemenu__link"
            href="/tableau-de-bord"
          >
            <span
              aria-hidden="true"
              className="fr-icon-dashboard-3-line fr-mr-1w"
            />
            {'Tableau de bord'}
          </Link>
        </li>
        {
          sessionUtilisateurViewModel.isGestionnaireDepartement ? (
            <>
              <li className="fr-sidemenu__item">
                <Link
                  className="fr-sidemenu__link"
                  href={`/gouvernance/${sessionUtilisateurViewModel.codeDepartement}`}
                >
                  <span
                    aria-hidden="true"
                    className="fr-icon-compass-3-line fr-mr-1w"
                  />
                  {'Gouvernance'}
                </Link>
              </li>
              <li className="fr-sidemenu__item">
                <Link
                  className="fr-sidemenu__link"
                  href={`/gouvernance-vide/${sessionUtilisateurViewModel.codeDepartement}`}
                >
                  <span
                    aria-hidden="true"
                    className="fr-icon-compass-3-line fr-mr-1w"
                  />
                  {'Gouvernance vide'}
                </Link>
              </li>
            </>
          ) : null
        }
      </ul>
    </nav>
  )
}
