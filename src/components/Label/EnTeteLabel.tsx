'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ReactElement } from 'react'

import styles from './EnTeteLabel.module.css'

export default function EnTeteLabel(): ReactElement {
  return (
    <header className="fr-header">
      <div className="fr-header__body">
        <div className="fr-header__body-row fr-px-5w">
          <div className="fr-header__brand">
            <div className="fr-header__brand-top">
              <div className="fr-header__logo">
                <Link href="/tableau-de-bord" title="Retour au tableau de bord">
                  <Image alt="ANCT Société Numérique" height={64} src="/societe-numerique.svg" width={150} />
                </Link>
              </div>
              <div className="fr-header__navbar">
                <button
                  aria-controls="modal-menu-label"
                  aria-haspopup="menu"
                  className="fr-btn--menu fr-btn"
                  data-fr-opened="false"
                  id="bouton-menu-label"
                  type="button"
                >
                  Menu
                </button>
              </div>
            </div>
            <div aria-hidden="true" className={styles.separateur} />
            <div className="fr-header__service">
              <Link href="/label" title="Accueil labellisation">
                <p
                  className="fr-header__service-title"
                  style={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}
                >
                  <Image alt="" height={52} src="/conum-full.svg" width={48} />
                  <span>
                    CONSEILLER
                    <br />
                    NUMÉRIQUE
                  </span>
                </p>
              </Link>
            </div>
          </div>
          <div className="fr-header__tools">
            <div className="fr-header__tools-links">
              <ul className="fr-btns-group">
                <li>
                  <a
                    className="fr-btn fr-btn--tertiary fr-btn--icon-left fr-icon-question-answer-line"
                    href="mailto:moninclusionnumerique@anct.gouv.fr"
                  >
                    J’ai une question
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Menu mobile requis par le JS du DSFR : il y clone les tools-links (menuLinks). */}
      <dialog aria-labelledby="bouton-menu-label" className="fr-header__menu fr-modal" id="modal-menu-label">
        <div className="fr-container">
          <button aria-controls="modal-menu-label" className="fr-btn--close fr-btn" type="button">
            Fermer
          </button>
          <div className="fr-header__menu-links" />
        </div>
      </dialog>
    </header>
  )
}
