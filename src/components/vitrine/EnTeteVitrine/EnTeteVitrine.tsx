import Link from 'next/link'
import { ReactElement } from 'react'

export default function EnTeteVitrine(): ReactElement {
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
                    aria-controls="modal-vitrine-menu"
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
      <nav
        aria-label="Menu principal"
        className="fr-header__menu"
        id="header-navigation"
      >
        <div className="fr-container">
          <ul className="fr-nav__list">
            <li className="fr-nav__item">
              <Link
                className="fr-nav__link"
                href="/vitrine"
              >
                Accueil
              </Link>
            </li>
            <li className="fr-nav__item">
              <Link
                className="fr-nav__link"
                href="/vitrine/lieux"
              >
                Lieux
              </Link>
            </li>
            <li className="fr-nav__item">
              <Link
                className="fr-nav__link"
                href="/vitrine/dispositifs"
              >
                Dispositifs
              </Link>
            </li>
            <li className="fr-nav__item">
              <Link
                className="fr-nav__link"
                href="/vitrine/donnees-territoriales"
              >
                Données territoriales
              </Link>
            </li>
            <li className="fr-nav__item">
              <Link
                className="fr-nav__link"
                href="/vitrine/outils-numeriques"
              >
                Outils numériques
              </Link>
            </li>
            <li className="fr-nav__item">
              <Link
                className="fr-nav__link"
                href="/vitrine/etudes-et-recherches"
              >
                Etudes et recherches
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <dialog
        aria-labelledby="button-vitrine-menu"
        className="fr-header__menu fr-modal"
        id="modal-vitrine-menu"
      >
        <div className="fr-container">
          <button
            aria-controls="modal-vitrine-menu"
            className="fr-btn--close fr-btn"
            type="button"
          >
            Fermer
          </button>
          <div className="fr-header__menu-links">
            <ul className="fr-nav__list">
              <li className="fr-nav__item">
                <Link
                  className="fr-nav__link"
                  href="/vitrine"
                >
                  Accueil
                </Link>
              </li>
              <li className="fr-nav__item">
                <Link
                  className="fr-nav__link"
                  href="/vitrine/lieux"
                >
                  Lieux
                </Link>
              </li>
              <li className="fr-nav__item">
                <Link
                  className="fr-nav__link"
                  href="/vitrine/dispositifs"
                >
                  Dispositifs
                </Link>
              </li>
              <li className="fr-nav__item">
                <Link
                  className="fr-nav__link"
                  href="/vitrine/donnees-territoriales"
                >
                  Données territoriales
                </Link>
              </li>
              <li className="fr-nav__item">
                <Link
                  className="fr-nav__link"
                  href="/vitrine/outils-numeriques"
                >
                  Outils numériques
                </Link>
              </li>
              <li className="fr-nav__item">
                <Link
                  className="fr-nav__link"
                  href="/vitrine/etudes-et-recherches"
                >
                  Etudes et recherches
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </dialog>
    </header>
  )
}
