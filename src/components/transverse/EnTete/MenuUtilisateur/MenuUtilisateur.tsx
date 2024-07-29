import Image from 'next/image'
import Link from 'next/link'
import { ReactElement, useContext } from 'react'

import styles from './MenuUtilisateur.module.css'
import { sessionUtilisateurNonAuthentifie } from '@/components/shared/SelecteurRole/session-utilisateur-presenter'
import { sessionUtilisateurContext } from '@/components/shared/SessionUtilisateurContext'

export default function MenuUtilisateur({ ariaControlsId }: MenuUtilisateurProps): ReactElement {
  const { session, setSession } = useContext(sessionUtilisateurContext)

  return (
    <div className={`fr-container ${styles['fr-container']}`}>
      <div className={`fr-mb-8v ${styles['zone-infos']}`}>
        <Image
          alt=""
          height={80}
          role="img"
          src={`${session.role.pictogramme}.svg`}
          width={80}
        />
        <div className="fr-mb-0 fr-h4">
          <span className={`color-blue-france ${styles.nom}`}>
            {session.prenom}
          </span>
          <span className={`color-blue-france ${styles.nom}`}>
            {session.nom}
          </span>
        </div>
        <div className={'fr-text--xs color-blue-france'}>
          {session.email}
        </div>
      </div>
      <ul
        aria-label="liens-menu"
        className={`fr-mb-8v fr-pb-8v fr-links-group ${styles['fr-links-group']} ${styles['zone-infos']}`}
      >
        <li>
          <Link
            aria-controls={ariaControlsId}
            className="fr-text--md fr-link fr-icon-account-circle-line fr-link--icon-left"
            href="/mes-informations-personnelles"
          >
            Mes informations
          </Link>
        </li>
        <li>
          <Link
            aria-controls={ariaControlsId}
            className="fr-text-md fr-link fr-icon-settings-5-line fr-link--icon-left"
            href="/"
          >
            Mes paramètres
          </Link>
        </li>
        <li>
          <Link
            aria-controls={ariaControlsId}
            className="fr-text-md fr-link fr-icon-team-line fr-link--icon-left"
            href="/"
          >
            Mes utilisateurs
          </Link>
        </li>
      </ul>
      <button
        className={`fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-logout-box-r-line ${styles.deconnexion}`}
        name="deconnexion"
        onClick={() => {
          setSession(sessionUtilisateurNonAuthentifie)
        }}
        type="button"
      >
        Se déconnecter
      </button>
    </div>
  )
}

type MenuUtilisateurProps = Readonly<{
  ariaControlsId: string
}>
