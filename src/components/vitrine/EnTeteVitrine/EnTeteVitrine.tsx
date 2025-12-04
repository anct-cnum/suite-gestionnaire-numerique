'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactElement } from 'react'

export default function EnTeteVitrine(): ReactElement {
  const pathname = usePathname()
  return (
    <header className="fr-header">
      <div className="fr-header__body">
        <div className="fr-container">
          <div className="fr-header__body-row">
            <div className="fr-header__brand fr-enlarge-link">
              <div className="fr-header__brand-top">
                <div className="fr-header__navbar">
                  <button
                    aria-controls="navigation"
                    aria-haspopup="menu"
                    className="fr-btn--menu fr-btn"
                    data-fr-opened="false"
                    id="button-vitrine-menu"
                    type="button"
                  >
                    Menu
                  </button>
                </div>
              </div>
              <div className="fr-header__service">
                <Link
                  href="/"
                  title="Accueil"
                >
                  <p className="fr-header__service-title">
                    Inclusion Numérique
                  </p>
                </Link>
              </div>
            </div>
            <div className="fr-header__tools">
              <div className="fr-header__tools-links">
                <ul className="fr-links-group">
                  <li>
                    <a
                      className="fr-link fr-icon-question-line"
                      href="mailto:moninclusionnumerique@anct.gouv.fr"
                    >
                      Aide
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        aria-labelledby="button-vitrine-menu"
        className="fr-header__menu fr-modal"
        id="navigation"
      >
        <div className="fr-container">
          <button
            aria-controls="navigation"
            className="fr-btn--close fr-btn"
            type="button"
          >
            Fermer
          </button>
          <div className="fr-header__menu-links">
            <ul className="fr-btns-group">
              <li>
                <a
                  className="fr-link fr-icon-question-line"
                  href="mailto:moninclusionnumerique@anct.gouv.fr"
                >
                  Aide
                </a>
              </li>
            </ul>
          </div>
          <nav
            aria-label="Menu principal"
            className="fr-nav"
            role="navigation"
          >
            <ul className="fr-nav__list">
              <li className="fr-nav__item">
                <Link
                  aria-current={pathname === '/vitrine' || pathname === '/' ? 'page' : undefined}
                  className="fr-nav__link"
                  href="/vitrine"
                >
                  Accueil
                </Link>
              </li>
              <li className="fr-nav__item">
                <Link
                  aria-current={pathname === '/vitrine/lieux' ? 'page' : undefined}
                  className="fr-nav__link"
                  href="/vitrine/lieux"
                >
                  Lieux
                </Link>
              </li>
              <li className="fr-nav__item">
                <Link
                  aria-current={pathname === '/vitrine/dispositifs' ? 'page' : undefined}
                  className="fr-nav__link"
                  href="/vitrine/dispositifs"
                >
                  Dispositifs
                </Link>
              </li>
              <li className="fr-nav__item">
                <Link
                  aria-current={pathname === '/vitrine/donnees-territoriales' ? 'page' : undefined}
                  className="fr-nav__link"
                  href="/vitrine/donnees-territoriales"
                >
                  Données territoriales
                </Link>
              </li>
              <li className="fr-nav__item">
                <Link
                  aria-current={pathname.startsWith('/vitrine/outils-numeriques') ? 'page' : undefined}
                  className="fr-nav__link"
                  href="/vitrine/outils-numeriques"
                >
                  Outils numériques
                </Link>
              </li>
              <li className="fr-nav__item">
                <button
                  aria-controls="menu-etudes"
                  aria-expanded="false"
                  className="fr-nav__btn"
                  type="button"
                >
                  Études et enquêtes
                </button>
                <div
                  className="fr-collapse fr-menu"
                  id="menu-etudes"
                >
                  <ul className="fr-menu__list">
                    <li>
                      <a
                        className="fr-nav__link"
                        href="https://www.societenumerique.gouv.fr/nos-ressources/etudes"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Études
                      </a>
                    </li>
                    <li>
                      <a
                        className="fr-nav__link"
                        href="https://labo.societenumerique.gouv.fr/fr/"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Labo Société Numérique
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
