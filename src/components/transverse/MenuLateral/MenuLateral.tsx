'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, ReactElement, useContext } from 'react'

import styles from './MenuLateral.module.css'
import { clientContext } from '@/components/shared/ClientContext'

export default function MenuLateral(): ReactElement {
  const { sessionUtilisateurViewModel } = useContext(clientContext)
  const currentPath = usePathname()

  const menusPilotage = [
    {
      ariaControls: 'fr-sidemenu-gouvernance',
      ariaExpanded: false,
      icon: 'compass-3-line',
      label: 'Gouvernance',
      sousMenu: [
        { label: 'Membres', url: `/membres/${sessionUtilisateurViewModel.codeDepartement}` },
        { label: 'Feuilles de route', url: `/feuilles-de-routes/${sessionUtilisateurViewModel.codeDepartement}` },
      ],
      url: `/gouvernance/${sessionUtilisateurViewModel.codeDepartement}`,
    },
    {
      icon: 'compass-3-line',
      label: 'Gouvernance vide',
      url: `/gouvernance-vide/${sessionUtilisateurViewModel.codeDepartement}`,
    },
    {
      icon: 'pen-nib-line',
      label: 'Financements',
      url: '/financements',
    },
    {
      icon: 'community-line',
      label: 'Bénéficiaires',
      url: '/beneficiaires',
    },
    {
      icon: 'group-line',
      label: 'Aidants et médiateurs',
      url: '/aidants-et-mediateurs',
    },
    {
      icon: 'map-pin-2-line',
      label: 'Lieux d’inclusion',
      url: '/lieux-inclusion',
    },
  ]

  const menusDonneesEtStatistiques = [
    {
      icon: 'download-line',
      label: 'Export de données',
      url: '/export-de-donnees',
    },
    {
      icon: 'line-chart-line',
      label: 'Rapports',
      url: '/rapports',
    },
  ]

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
        <li className={`fr-sidemenu__item ${currentPath === '/tableau-de-bord' ? styles['element-selectionne'] : ''}`}>
          <Link
            className="fr-sidemenu__link"
            href={{ pathname: '/tableau-de-bord' }}
          >
            <span
              aria-hidden="true"
              className={`fr-icon-dashboard-3-line fr-mr-1w ${currentPath === '/tableau-de-bord' ? styles['element-selectionne-text'] : ''}`}
            />
            <span
              className={currentPath === '/tableau-de-bord' ? styles['element-selectionne-text'] : ''}
            >
              Tableau de bord
            </span>
          </Link>
        </li>
      </ul>
      {
        sessionUtilisateurViewModel.displayLiensGouvernance ? (
          <>
            <p
              className={`fr-text--sm color-grey ${styles['menu-categorie']} fr-mt-2w`}
            >
              PILOTAGE
            </p>
            <hr className="fr-hr fr-mt-3v fr-col-12" />
            <ul className="fr-sidemenu__list">
              {menusPilotage.map((menu) => (
                <Fragment key={menu.url}>
                  <li
                    className={`fr-sidemenu__item ${menu.url === currentPath ? styles['element-selectionne'] : ''}`}
                  >
                    <Link
                      aria-controls={menu.ariaControls ?? ''}
                      aria-expanded={menu.ariaExpanded}
                      className="fr-sidemenu__link"
                      href={{ pathname: menu.url }}
                    >
                      <span
                        aria-hidden="true"
                        className={`fr-icon-${menu.icon} fr-mr-1w ${menu.url === currentPath ? styles['element-selectionne-text'] : ''}`}
                      />
                      <span
                        className={menu.url === currentPath ? styles['element-selectionne-text'] : ''}
                      >
                        {menu.label}
                      </span>
                    </Link>
                  </li>
                  {menu.sousMenu ?
                    <div
                      className="fr-collapse"
                      id={menu.ariaControls}
                    >
                      <ul className="fr-sidemenu__list">
                        {menu.sousMenu.map((sousMenuElement) => (
                          <li
                            className={`fr-sidemenu__item ${sousMenuElement.url === currentPath ? styles['element-selectionne'] : ''}`}
                            key={sousMenuElement.url}
                          >
                            <Link
                              className="fr-sidemenu__link"
                              href={{ pathname: sousMenuElement.url }}
                            >
                              {sousMenuElement.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div> : null}
                </Fragment>))}
            </ul>
            <p className={`fr-text--sm color-grey ${styles['menu-categorie']} fr-mt-2w`}>
              DONNEES ET STATISTIQUES
            </p>
            <ul className="fr-sidemenu__list">
              {menusDonneesEtStatistiques.map((menu) => (
                <li
                  className={`fr-sidemenu__item ${menu.url === currentPath ? styles['element-selectionne'] : ''}`}
                  key={menu.url}
                >
                  <Link
                    className="fr-sidemenu__link"
                    href={{ pathname: menu.url }}
                  >
                    <span
                      aria-hidden="true"
                      className={`fr-icon-${menu.icon} fr-mr-1w ${menu.url === currentPath ? styles['element-selectionne-text'] : ''}`}
                    />
                    <span className={menu.url === currentPath ? styles['element-selectionne-text'] : ''}>
                      {menu.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null
      }
    </nav>
  )
}
