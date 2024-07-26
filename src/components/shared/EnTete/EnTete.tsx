import Image from 'next/image'
import Link from 'next/link'
import { ReactElement, useContext } from 'react'

import '@gouvfr/dsfr/dist/component/header/header.min.css'
import '@gouvfr/dsfr/dist/component/modal/modal.min.css'
import '@gouvfr/dsfr/dist/component/button/button.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-system/icons-system.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-media/icons-media.min.css'

import styles from './EnTete.module.css'
import { sessionUtilisateurNonAuthentifie } from '../SelecteurRole/session-utilisateur-presenter'
import { sessionUtilisateurContext } from '@/components/shared/SessionUtilisateurContext'

export default function EnTete(): ReactElement {
  const { session, setSession } = useContext(sessionUtilisateurContext)

  return (
    <header className="fr-header">
      <div className="fr-header__body">
        <div className="fr-container">
          <div className="fr-header__body-row">
            <div className="fr-header__brand fr-enlarge-link">
              <div className="fr-header__brand-top">
                <div className="fr-header__operator">
                  <Image
                    alt=""
                    height={70}
                    src={`${session.role.pictogramme}.svg`}
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
                    <span className={styles['libelle-session-utilisateur__prefix']}>
                      FNE
                    </span>
                    <span className={`${styles['libelle-session-utilisateur__prefix']} ${styles['libelle-session-utilisateur__separateur']}`}>
                      &nbsp;/&nbsp;
                    </span>
                    {session.role.libelle}
                  </p>
                </Link>
              </div>
            </div>
            <div className="fr-header__tools">
              <div className="fr-header__tools-links">
                <ul
                  aria-label="menu"
                  className={`fr-links-group ${styles['fr-links-group']}`}
                >
                  <li>
                    <Link
                      className="fr-link fr-icon-search-line"
                      href="/"
                    >
                      Rechercher
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="fr-link fr-icon-question-line"
                      href="/"
                    >
                      Aide
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="fr-link fr-icon-notification-3-line"
                      href="/"
                    >
                      Notifications
                      {/**/}
                      <span
                        aria-hidden="true"
                        className="fr-icon-arrow-down-s-line"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="fr-link"
                      href="/"
                      onClick={() => {
                        setSession(sessionUtilisateurNonAuthentifie)
                      }}
                    >
                      {`${session.prenom} ${session.nom}`}
                      <span
                        aria-hidden="true"
                        className="fr-icon-arrow-down-s-line"
                      />
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
