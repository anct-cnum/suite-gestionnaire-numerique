'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactElement } from 'react'

import styles from './EnTeteVitrine.module.css'
import { etatCourant } from '../navigation/etatCourant'
import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'

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
                  <svg
                    aria-hidden="true"
                    height="40"
                    viewBox="0 0 37.1536 42.8571"
                    width="35"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.6291 0L0 10.7143V32.1429L18.6291 42.8571L37.1536 32.1429V10.7143L18.6291 0Z"
                      fill="#E1000F"
                    />
                    <path
                      d="M23.914 18.3448H30.9261V14.2682L18.6288 7.16016L6.22684 14.2682V28.4842L18.6288 35.6967L30.9261 28.4842V24.4598H23.914V18.3448Z"
                      fill="#FFFFFF"
                    />
                    <path
                      d="M23.9139 24.46V18.345L18.6287 15.2614L13.2388 18.345V24.46L18.6287 27.5436L23.9139 24.46Z"
                      fill="#000091"
                    />
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
                <Link aria-label="Retour à l'accueil Inclusion Numérique" href="/">
                  <p aria-hidden="true" className="fr-header__service-title">
                    Inclusion Numérique
                  </p>
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
          <nav aria-label="Menu principal" className={`fr-nav ${styles.navigation}`} role="navigation">
            <ul className="fr-nav__list">
              {rubriques.map((rubrique) => (
                <li className="fr-nav__item" key={rubrique.href}>
                  <Link
                    aria-current={etatCourant(pathname, rubrique.href)}
                    className="fr-nav__link"
                    href={rubrique.href}
                  >
                    {rubrique.libelle}
                  </Link>
                </li>
              ))}
              <li className="fr-nav__item">
                <button aria-controls="menu-etudes" aria-expanded="false" className="fr-nav__btn" type="button">
                  Études et enquêtes
                </button>
                <div className="fr-collapse fr-menu" id="menu-etudes">
                  <ul className="fr-menu__list">
                    <li>
                      <ExternalLink
                        className="fr-nav__link"
                        href="https://www.societenumerique.gouv.fr/nos-ressources/etudes"
                        title="Études"
                      >
                        Études
                      </ExternalLink>
                    </li>
                    <li>
                      <ExternalLink
                        className="fr-nav__link"
                        href="https://labo.societenumerique.gouv.fr/fr/"
                        title="Labo Société Numérique"
                      >
                        Labo Société Numérique
                      </ExternalLink>
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

// Adresses publiques : le préfixe technique /vitrine n'apparaît jamais dans la barre d'adresse.
const rubriques: ReadonlyArray<Readonly<{ href: string; libelle: string }>> = [
  { href: '/', libelle: 'Accueil' },
  { href: '/lieux', libelle: 'Lieux' },
  { href: '/dispositifs', libelle: 'Dispositifs' },
  { href: '/donnees-territoriales', libelle: 'Données territoriales' },
  { href: '/outils-numeriques', libelle: 'Outils numériques' },
]
