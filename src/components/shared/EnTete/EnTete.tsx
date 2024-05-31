import Image from 'next/image'
import Link from 'next/link'
import { ReactElement } from 'react'

import '@gouvfr/dsfr/dist/component/header/header.min.css'
import '@gouvfr/dsfr/dist/component/logo/logo.min.css'
import '@gouvfr/dsfr/dist/component/modal/modal.min.css'
import '@gouvfr/dsfr/dist/component/button/button.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-system/icons-system.min.css'

export default function EnTete(): ReactElement {
  return (
    <header className="fr-header">
      <div className="fr-header__body">
        <div className="fr-container">
          <div className="fr-header__body-row">
            <div className="fr-header__brand fr-enlarge-link">
              <div className="fr-header__brand-top">
                <div className="fr-header__logo">
                  <p className="fr-logo">
                    République
                    <br />
                    Française
                  </p>
                </div>
                <div className="fr-header__operator">
                  <Image
                    alt="Accueil"
                    className="fr-responsive-img"
                    height={70}
                    src="/logo.svg"
                    width={70}
                  />
                </div>
                <div className="fr-header__navbar">
                  <button
                    aria-controls="modal-499"
                    aria-haspopup="menu"
                    className="fr-btn--menu fr-btn"
                    data-fr-opened="false"
                    id="button-500"
                    title="Menu"
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
                    Suite gestionnaire numérique
                  </p>
                </Link>
                <p className="fr-header__service-tagline">
                  baseline - précisions sur l’organisation
                </p>
              </div>
            </div>
            <div className="fr-header__tools">
              <div className="fr-header__tools-links">
                <ul className="fr-links-group">
                  <li>
                    <Link
                      className="fr-link fr-icon-lock-line"
                      href="/"
                    >
                      Se connecter
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <dialog
        aria-labelledby="button-500"
        className="fr-header__menu fr-modal"
        id="modal-499"
      >
        <div className="fr-container">
          <button
            aria-controls="modal-499"
            className="fr-btn--close fr-btn"
            title="Fermer"
            type="button"
          >
            Fermer
          </button>
          <div className="fr-header__menu-links" />
        </div>
      </dialog>
    </header>
  )
}
