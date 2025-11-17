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
                <div className="fr-header__logo">
                  <Link
                    href="/"
                    title="Accueil"
                  >
                    <p className="fr-logo">
                      République
                      <br />
                      Française
                    </p>
                  </Link>
                </div>
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
                  aria-current={pathname === '/vitrine' ? 'page' : undefined}
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
                  aria-current={pathname === '/vitrine/outils-numeriques' ? 'page' : undefined}
                  className="fr-nav__link"
                  href="/vitrine/outils-numeriques"
                >
                  Outils numériques
                </Link>
              </li>
              <li className="fr-nav__item">
                <Link
                  aria-current={pathname === '/vitrine/etudes-et-recherches' ? 'page' : undefined}
                  className="fr-nav__link"
                  href="/vitrine/etudes-et-recherches"
                >
                  Etudes et recherches
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
