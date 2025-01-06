'use client'

import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { ReactElement, useContext } from 'react'

import styles from './MenuUtilisateur.module.css'
import { clientContext } from '@/components/shared/ClientContext'
import SelecteurRole from '@/components/transverse/EnTete/MenuUtilisateur/SelecteurRole/SelecteurRole'

export default function MenuUtilisateur({ ariaControlsId }: Props): ReactElement {
  const { sessionUtilisateurViewModel } = useContext(clientContext)

  return (
    <>
      <div className={`fr-mb-8v ${styles['zone-infos']}`}>
        <Image
          alt=""
          className="grey-border"
          height={80}
          src={`${sessionUtilisateurViewModel.role.pictogramme}.svg`}
          width={80}
        />
        <div className="fr-mb-0 fr-h4">
          <span className={`color-blue-france ${styles.nom}`}>
            {sessionUtilisateurViewModel.prenom}
          </span>
          <span className={`color-blue-france ${styles.nom}`}>
            {sessionUtilisateurViewModel.nom}
          </span>
        </div>
        <div className="fr-text--xs color-blue-france">
          {sessionUtilisateurViewModel.email}
        </div>
      </div>
      <ul
        aria-label="liens-menu"
        className={`fr-mb-6v fr-pb-6v fr-links-group ${styles['fr-links-group']} ${styles['zone-infos']}`}
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
            href="/mes-parametres"
          >
            Mes paramètres
          </Link>
        </li>
        <li>
          <Link
            aria-controls={ariaControlsId}
            className="fr-text-md fr-link fr-icon-team-line fr-link--icon-left"
            href="/mes-utilisateurs"
          >
            Mes utilisateurs
          </Link>
        </li>
      </ul>
      <SelecteurRole ariaControlsId={ariaControlsId} />
      <div className="fr-btns-group--center">
        <button
          className={`fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-logout-box-r-line ${styles.deconnexion} fr-col-12`}
          name="deconnexion"
          onClick={async () => signOut({ callbackUrl: '/connexion' })}
          type="button"
        >
          Se déconnecter
        </button>
      </div>
    </>
  )
}

type Props = Readonly<{
  ariaControlsId: string
}>
