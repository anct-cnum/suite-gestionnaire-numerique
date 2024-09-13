'use client'

import Link from 'next/link'
import { ReactElement, useContext, useState } from 'react'

import styles from './EnTete.module.css'
import MenuUtilisateur from './MenuUtilisateur/MenuUtilisateur'
import Drawer from '@/components/shared/Drawer/Drawer'
import { sessionUtilisateurContext } from '@/components/shared/SessionUtilisateurContext'

export default function EnTete(): ReactElement {
  const { session } = useContext(sessionUtilisateurContext)
  // Stryker disable next-line BooleanLiteral
  const [isOpen, setIsOpen] = useState(false)
  const drawerId = 'drawer-menu-utilisateur'

  return (
    <>
      <header className="fr-header fr-mb-5w">
        <div className="fr-header__body">
          <div className="fr-px-5w">
            <div className="fr-header__body-row">
              <div className="fr-header__brand fr-enlarge-link">
                <div className="fr-header__brand-top">
                  <div className="fr-header__operator">
                    <svg
                      height="40"
                      width="35"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.387 0 0 10v20l17.387 10 17.29-10V10z"
                        fill="#e1000f"
                      />
                      <path
                        d="M22.32 17.122h6.545v-3.805L17.387 6.683 5.812 13.317v13.268l11.575 6.732 11.478-6.732V22.83H22.32z"
                        fill="#fff"
                      />
                      <path
                        d="M22.32 22.83v-5.708l-4.933-2.878-5.03 2.878v5.707l5.03 2.878z"
                        fill="#000091"
                      />
                    </svg>
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
                      <span className={`${styles['libelle-session-utilisateur__prefix']} color-grey`}>
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
                    id="menuUtilisateur"
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
                      <button
                        aria-controls={drawerId}
                        className="fr-link"
                        data-fr-opened="false"
                        onClick={() => {
                          setIsOpen(true)
                        }}
                        type="button"
                      >
                        {`${session.prenom} ${session.nom}`}
                        <span
                          aria-hidden="true"
                          className="fr-icon-arrow-down-s-line"
                        />
                      </button>
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
      <Drawer
        boutonFermeture="Fermer le menu"
        id={drawerId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={true}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <MenuUtilisateur ariaControlsId={drawerId} />
      </Drawer>
    </>
  )
}
