'use client'

import Link from 'next/link'
import { Fragment, ReactElement, useContext } from 'react'

import Icon from './Icon'
import styles from './MenuLateral.module.css'
import { clientContext } from '@/components/shared/ClientContext'

export default function MenuLateral(): ReactElement {
  const { pathname, sessionUtilisateurViewModel } = useContext(clientContext)

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
        <li className={`fr-sidemenu__item ${pathname === '/tableau-de-bord' ? `fr-sidemenu__item--active ${styles['element-selectionne']}` : ''}`}>
          <Link
            aria-current={pathname === '/tableau-de-bord' ? 'page' : false}
            className="fr-sidemenu__link"
            href="/tableau-de-bord"
          >
            <Icon icon="dashboard-3-line" />
            Tableau de bord
          </Link>
        </li>
      </ul>
      {
        sessionUtilisateurViewModel.displayLiensGouvernance ? (
          <>
            <p className={`fr-text--sm color-grey ${styles['menu-categorie']} fr-mt-2w`}>
              PILOTAGE
            </p>
            <ul className="fr-sidemenu__list">
              {menusPilotage.map((menu) => (
                <Fragment key={menu.url}>
                  <li className={`fr-sidemenu__item ${pathname === menu.url ? `fr-sidemenu__item--active ${styles['element-selectionne']}` : ''}`}>
                    <Link
                      aria-controls={menu.ariaControls ?? ''}
                      aria-current={pathname === menu.url ? 'page' : false}
                      aria-expanded={menu.ariaExpanded}
                      className="fr-sidemenu__link"
                      href={menu.url}
                    >
                      <Icon icon={menu.icon} />
                      {menu.label}
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
                            className={`fr-sidemenu__item ${pathname === sousMenuElement.url ? `fr-sidemenu__item--active ${styles['element-selectionne']}` : ''}`}
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
                        ))}
                      </ul>
                    </div> : null}
                </Fragment>))}
            </ul>
            <p className={`fr-text--sm color-grey ${styles['menu-categorie']} fr-mt-2w`}>
              DONNÉES ET STATISTIQUES
            </p>
            <ul className="fr-sidemenu__list">
              {menusDonneesEtStatistiques.map((menu) => (
                <li
                  className={`fr-sidemenu__item ${pathname === menu.url ? `fr-sidemenu__item--active ${styles['element-selectionne']}` : ''}`}
                  key={menu.url}
                >
                  <Link
                    aria-current={pathname === menu.url ? 'page' : false}
                    className="fr-sidemenu__link"
                    href={menu.url}
                  >
                    <Icon icon={menu.icon} />
                    {menu.label}
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
