'use client'

import Link from 'next/link'
import { ReactElement, useContext, useId, useState } from 'react'

import styles from './EnTete.module.css'
import MenuUtilisateur from './MenuUtilisateur/MenuUtilisateur'
import { clientContext } from '@/components/shared/ClientContext'
import Drawer from '@/components/shared/Drawer/Drawer'
import Icon from '@/components/shared/Icon/Icon'

export default function EnTete(): ReactElement {
  const { sessionUtilisateurViewModel } = useContext(clientContext)
  // Stryker disable next-line BooleanLiteral
  const [isOpen, setIsOpen] = useState(false)
  const drawerId = 'drawerMenuUtilisateurId'
  const labelId = useId()

  return (
    <>
      <header className="fr-header">
        <div className="fr-header__body">
          <div className={`fr-header__body-row fr-px-5w ${styles['fr-header__body-row']}`}>
            <div className="fr-header__brand fr-enlarge-link">
              <div className="fr-header__brand-top">
                <div className="fr-header__logo">
                  <svg
                    aria-hidden="true"
                    height="40"
                    viewBox="0 0 42 40"
                    width="42"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.00698 8.85371C4.62583 9.65112 3.77736 11.127 3.78323 12.7218L3.83654 27.2057C3.84234 28.783 4.68308 30.2392 6.04613 31.0329L18.563 38.321C19.9411 39.1235 21.6435 39.1266 23.0247 38.3292L35.4671 31.1456C36.8482 30.3482 37.6967 28.8723 37.6908 27.2775L37.6375 12.7936C37.6317 11.2163 36.791 9.76009 35.4279 8.96643L22.9111 1.67829C21.5329 0.875808 19.8305 0.872674 18.4494 1.67008L6.00698 8.85371ZM10.0593 26.1644L10.0136 13.7303L20.6694 7.5782L31.4147 13.8349L31.4605 26.2689L22.4765 31.4559L21.3057 35.0852C21.0406 35.9071 19.8777 35.9071 19.6126 35.0852L18.2788 30.9503L10.0593 26.1644Z"
                      fill="url(#paint0_linear_9654_19024)"
                    />
                    <path
                      d="M20.4982 15.1556L16.0246 17.7385L16.0437 22.9389L20.5378 25.5556L25.0115 22.9728L24.9923 17.7724L20.4982 15.1556Z"
                      fill="#E1000F"
                    />
                    <defs>
                      <linearGradient
                        gradientUnits="userSpaceOnUse"
                        id="paint0_linear_9654_19024"
                        x1="13.7878"
                        x2="31.3025"
                        y1="38.2486"
                        y2="5.32261"
                      >
                        <stop stopColor="#0C008A" />
                        <stop
                          offset="0.51"
                          stopColor="#5F5FE0"
                        />
                        <stop
                          offset="1"
                          stopColor="#F4849A"
                        />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="fr-header__navbar">
                  <button
                    aria-controls="modal-499"
                    aria-haspopup="menu"
                    className="fr-btn--menu fr-btn"
                    data-fr-opened="false"
                    id="button-500"
                    type="button"
                  >
                    Menu
                  </button>
                </div>
              </div>
              <div className="fr-header__service">
                <Link
                  href="/tableau-de-bord"
                  title="Accueil"
                >
                  <p className="fr-header__service-title">
                    <span className={styles['libelle-session-utilisateur__prefix']}>
                      MIN
                    </span>
                    <span className={`${styles['libelle-session-utilisateur__prefix']} color-grey`}>
                      &nbsp;/&nbsp;
                    </span>
                    {sessionUtilisateurViewModel.role.libelle}
                  </p>
                </Link>
              </div>
            </div>
            <div className="fr-header__tools">
              <button
                aria-controls={drawerId}
                className="fr-link"
                data-fr-opened="false"
                onClick={() => {
                  setIsOpen(true)
                }}
                type="button"
              >
                {`${sessionUtilisateurViewModel.prenom} ${sessionUtilisateurViewModel.nom}`}
                <Icon icon="arrow-down-s-line" />
              </button>
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
        closeDrawer={() => {
          setIsOpen(false)
        }}
        id={drawerId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={true}
        isOpen={isOpen}
        labelId={labelId}
      >
        <MenuUtilisateur ariaControlsId={drawerId} />
      </Drawer>
    </>
  )
}
