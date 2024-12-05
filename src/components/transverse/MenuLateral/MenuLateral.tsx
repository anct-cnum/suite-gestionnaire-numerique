'use client'

import Link from 'next/link'
import { ReactElement, useContext } from 'react'

import styles from './MenuLateral.module.css'
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
              aria-label="tableau de bord"
              className="fr-icon-dashboard-3-line fr-mr-1w"
            />
            {'Tableau de bord'}
          </Link>
        </li>
        {
          sessionUtilisateurViewModel.displayLiensGouvernance ? (
            <>
              <p
                className={`fr-text--sm color-grey ${styles['menu-categorie']}  fr-mt-2w`}
              >
                PILOTAGE
              </p>
              <hr className="fr-hr fr-mt-3v fr-col-12" />
              <li className="fr-sidemenu__item">
                <Link
                  className="fr-sidemenu__link"
                  href={`/gouvernance/${sessionUtilisateurViewModel.codeDepartement}`}
                >
                  <span
                    aria-controls="fr-sidemenu-gouvernance"
                    aria-expanded="false"
                    aria-hidden="true"
                    className="fr-icon-compass-3-line fr-mr-1w"
                  />
                  {'Gouvernance'}
                </Link>
                <div
                  className="fr-collapse"
                  id="fr-sidemenu-gouvernance"
                >
                  <ul className="fr-sidemenu__list">
                    <li className="fr-sidemenu__item">
                      <a
                        className="fr-sidemenu__link"
                        href="/"
                        target="_self"
                      >
                        Membres
                      </a>
                    </li>
                    <li className="fr-sidemenu__item">
                      <a
                        className="fr-sidemenu__link"
                        href="/"
                        target="_self"
                      >
                        Feuilles de route
                      </a>
                    </li>
                  </ul>
                </div>
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
              <li className="fr-sidemenu__item">
                <Link
                  className="fr-sidemenu__link"
                  href="/"
                >
                  <span
                    aria-hidden="true"
                    className="fr-icon-pen-nib-line fr-mr-1w"
                  />
                  {'Financements'}
                </Link>
              </li>
              <li className="fr-sidemenu__item">
                <Link
                  className="fr-sidemenu__link"
                  href="/"
                >
                  <span
                    aria-hidden="true"
                    className="fr-icon-community-line fr-mr-1w"
                  />
                  {'Bénéficiaires'}
                </Link>
              </li>
              <li className="fr-sidemenu__item">
                <Link
                  className="fr-sidemenu__link"
                  href="/"
                >
                  <span
                    aria-hidden="true"
                    className="fr-icon-group-line fr-mr-1w"
                  />
                  {'Aidants et médiateurs'}
                </Link>
              </li>

              <li className="fr-sidemenu__item">
                <Link
                  className="fr-sidemenu__link"
                  href="/"
                >
                  <span
                    aria-hidden="true"
                    className="fr-icon-map-pin-2-line fr-mr-1w"
                  />
                  {'Lieux d’inclusion'}
                </Link>
              </li>
              <p className={`fr-text--sm color-grey ${styles['menu-categorie']}  fr-mt-2w`}>
                DONNEES ET STATISTIQUES
              </p>
              <li className="fr-sidemenu__item">
                <Link
                  className="fr-sidemenu__link"
                  href="/"
                >
                  <span
                    aria-hidden="true"
                    className="fr-icon-download-line fr-mr-1w"
                  />
                  {'Export de données'}
                </Link>
              </li>
              <li className="fr-sidemenu__item">
                <Link
                  className="fr-sidemenu__link"
                  href="/"
                >
                  <span
                    aria-hidden="true"
                    className="fr-icon-line-chart-line fr-mr-1w"
                  />
                  {'Rapports'}
                </Link>
              </li>
            </>
          ) : null
        }
      </ul>
    </nav>
  )
}
