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
                <div className="fr-header__logo" style={{ alignItems: 'center', alignSelf: 'center', display: 'flex' }}>
                  <svg aria-hidden="true" height="40" viewBox="0 0 42 40" width="42" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M6.00698 8.85371C4.62583 9.65112 3.77736 11.127 3.78323 12.7218L3.83654 27.2057C3.84234 28.783 4.68308 30.2392 6.04613 31.0329L18.563 38.321C19.9411 39.1235 21.6435 39.1266 23.0247 38.3292L35.4671 31.1456C36.8482 30.3482 37.6967 28.8723 37.6908 27.2775L37.6375 12.7936C37.6317 11.2163 36.791 9.76009 35.4279 8.96643L22.9111 1.67829C21.5329 0.875808 19.8305 0.872674 18.4494 1.67008L6.00698 8.85371ZM10.0593 26.1644L10.0136 13.7303L20.6694 7.5782L31.4147 13.8349L31.4605 26.2689L22.4765 31.4559L21.3057 35.0852C21.0406 35.9071 19.8777 35.9071 19.6126 35.0852L18.2788 30.9503L10.0593 26.1644Z"
                      fill="url(#paint0_linear_vitrine)"
                    />
                    <path
                      d="M20.4982 15.1556L16.0246 17.7385L16.0437 22.9389L20.5378 25.5556L25.0115 22.9728L24.9923 17.7724L20.4982 15.1556Z"
                      fill="#E1000F"
                    />
                    <defs>
                      <linearGradient
                        gradientUnits="userSpaceOnUse"
                        id="paint0_linear_vitrine"
                        x1="13.7878"
                        x2="31.3025"
                        y1="38.2486"
                        y2="5.32261"
                      >
                        <stop stopColor="#0C008A" />
                        <stop offset="0.51" stopColor="#5F5FE0" />
                        <stop offset="1" stopColor="#F4849A" />
                      </linearGradient>
                    </defs>
                  </svg>
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
                <Link href="/" title="Accueil">
                  <p className="fr-header__service-title">Inclusion Numérique</p>
                </Link>
              </div>
            </div>
            <div className="fr-header__tools">
              <div className="fr-header__tools-links">
                <ul className="fr-links-group">
                  <li>
                    <a className="fr-link fr-icon-question-line" href="mailto:moninclusionnumerique@anct.gouv.fr">
                      Aide
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div aria-labelledby="button-vitrine-menu" className="fr-header__menu fr-modal" id="navigation">
        <div className="fr-container">
          <button aria-controls="navigation" className="fr-btn--close fr-btn" type="button">
            Fermer
          </button>
          <div className="fr-header__menu-links">
            <ul className="fr-btns-group">
              <li>
                <a className="fr-link fr-icon-question-line" href="mailto:moninclusionnumerique@anct.gouv.fr">
                  Aide
                </a>
              </li>
            </ul>
          </div>
          <nav aria-label="Menu principal" className="fr-nav" role="navigation">
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
                <button aria-controls="menu-etudes" aria-expanded="false" className="fr-nav__btn" type="button">
                  Études et enquêtes
                </button>
                <div className="fr-collapse fr-menu" id="menu-etudes">
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
