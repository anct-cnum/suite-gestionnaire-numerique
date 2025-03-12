'use client'

import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { ReactElement } from 'react'

import styles from './Connexion.module.css'
import France from './France'
import ProConnect from './ProConnect'
import ExternalLink from '../shared/ExternalLink/ExternalLink'
import PageTitle from '../shared/PageTitle/PageTitle'

export default function Connexion({ idProvider }: Props): ReactElement {
  return (
    <div className={`fr-grid-row fr-grid-row-gutters fr-grid-row--center ${styles.center} ${styles['blue-background']}`}>
      <div className="fr-col-1" />
      <div className="fr-col-4">
        <France />
        <div className="fr-h2 color-blue-france">
          Mon inclusion numérique
        </div>
        <div className="color-blue-france fr-mb-4w">
          Pilotez votre politique d’inclusion numérique grâce aux données
        </div>
        <div>
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/coop.svg`}
            width={50}
          />
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/carto-nationale.svg`}
            width={50}
          />
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/aidants-connect.svg`}
            width={50}
          />
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/conum.svg`}
            width={50}
          />
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/mednum.svg`}
            width={50}
          />
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/data-inclusion.svg`}
            width={50}
          />
        </div>
      </div>
      <div className="fr-col-2" />
      <div className="fr-col-4">
        <PageTitle>
          Se connecter
        </PageTitle>
        <p>
          Accédez à ce service grâce à ProConnect,
          votre identifiant unique pour accéder à plusieurs services de l’État.
        </p>
        <div className="fr-mb-6v">
          <button
            className="fr-btn fr-mb-2w fr-text--lg"
            onClick={async () => signIn(idProvider, { callbackUrl: '/' })}
            title="S’identifier avec ProConnect"
            type="button"
          >
            <ProConnect />
            &nbsp;S’identifier avec&nbsp;
            <span className="font-weight-700">
              ProConnect
            </span>
          </button>
          <p className="color-blue-france">
            <ExternalLink
              href="https://www.proconnect.gouv.fr/"
              title="ProConnect"
            >
              En savoir plus sur ProConnect
            </ExternalLink>
          </p>
        </div>
      </div>
      <div className="fr-col-1" />
    </div>
  )
}

type Props = Readonly<{
  idProvider: string
}>
