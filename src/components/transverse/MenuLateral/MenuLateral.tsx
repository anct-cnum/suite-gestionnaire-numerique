'use client'

import Link from 'next/link'
import { Fragment, PropsWithChildren, ReactElement, useContext } from 'react'

import styles from './MenuLateral.module.css'
import Badge from '@/components/shared/Badge/Badge'
import { clientContext } from '@/components/shared/ClientContext'
import Icon from '@/components/shared/Icon/Icon'

export default function MenuLateral({ children }: Readonly<PropsWithChildren>): ReactElement {
  const { pathname, sessionUtilisateurViewModel } = useContext(clientContext)

  const menusPilotage = [
    {
      ariaControls: 'fr-sidemenu-gouvernance',
      ariaExpanded: false,
      icon: 'compass-3-line',
      label: 'Gouvernance',
      url: `/gouvernance/${sessionUtilisateurViewModel.codeDepartement}`,
    },
  ]

  const menusAVenir = [
    {
      icon: 'pen-nib-line',
      label: 'Financements',
      url: `/gouvernance/${sessionUtilisateurViewModel.codeDepartement}/financements`,
    },
    {
      icon: 'community-line',
      label: 'Bénéficiaires',
      url: `/gouvernance/${sessionUtilisateurViewModel.codeDepartement}/beneficiaires`,
    },
    {
      icon: 'group-line',
      label: 'Aidants et médiateurs',
      url: '/aidants-et-mediateurs',
    },
    {
      icon: 'map-pin-2-line',
      label: 'Lieux d‘inclusion',
      url: '/lieux-inclusion',
    },
  ]

  const activeClass = pathname === '/tableau-de-bord' ? `fr-sidemenu__item--active ${styles['element-selectionne']}` : ''

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
        <li className={`fr-sidemenu__item ${activeClass}`}>
          <Link
            aria-current={pathname === '/tableau-de-bord' ? 'page' : false}
            className="fr-sidemenu__link"
            href="/tableau-de-bord"
          >
            <Icon
              classname="fr-mr-1w"
              icon="dashboard-3-line"
            />
            Tableau de bord
          </Link>
        </li>
      </ul>
      {
        sessionUtilisateurViewModel.displayLiensGouvernance ? (
          <>
            <p className="fr-text--sm color-grey separator fr-mt-2w fr-mb-1w">
              PILOTAGE
            </p>
            <ul className="fr-sidemenu__list">
              {menusPilotage.map((menu) => {
                const activeClass = pathname === menu.url ? `fr-sidemenu__item--active ${styles['element-selectionne']}` : ''

                return (
                  <Fragment key={menu.url}>
                    <li className={`fr-sidemenu__item ${activeClass}`}>
                      <Link
                        aria-controls={menu.ariaControls}
                        aria-current={pathname === menu.url ? 'page' : false}
                        aria-expanded={menu.ariaExpanded}
                        className="fr-sidemenu__link"
                        href={menu.url}
                      >
                        <Icon
                          classname="fr-mr-1w"
                          icon={menu.icon}
                        />
                        {menu.label}
                      </Link>
                      {children}
                    </li>
                  </Fragment>
                )
              })}
            </ul>
            <div className="fr-text--sm color-grey separator fr-mt-2w fr-mb-1w">
              <Badge
                color="new"
                icon={true}
              >
                à venir
              </Badge>
            </div>
            <ul className="fr-sidemenu__list">
              {menusAVenir.map((menu) => {
                const activeClass = pathname === menu.url ? `fr-sidemenu__item--active ${styles['element-selectionne']}` : ''

                return (
                  <li
                    className={`fr-sidemenu__item ${activeClass}`}
                    key={menu.url}
                  >
                    <Link
                      aria-current={pathname === menu.url ? 'page' : false}
                      className="fr-sidemenu__link"
                      href={menu.url}
                    >
                      <span className="color-grey">
                        <Icon
                          classname="fr-mr-1w"
                          icon={menu.icon}
                        />
                        {menu.label}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        ) : null
      }
    </nav>
  )
}
