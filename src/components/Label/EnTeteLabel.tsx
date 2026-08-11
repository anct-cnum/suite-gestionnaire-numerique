'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ReactElement } from 'react'

export default function EnTeteLabel(): ReactElement {
  return (
    <header className="fr-header">
      <div className="fr-header__body">
        <div className="fr-header__body-row fr-px-5w">
          <div className="fr-header__brand fr-enlarge-link">
            <div className="fr-header__brand-top">
              <div className="fr-header__logo">
                <Image
                  alt="Agence Nationale de la Cohésion des Territoires"
                  height={40}
                  src="/anct-texte.svg"
                  width={120}
                />
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
              <ul className="fr-links-group">
                <li>
                  <a className="fr-link fr-icon-question-line" href="mailto:moninclusionnumerique@anct.gouv.fr">
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
