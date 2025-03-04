'use client'

import { signIn } from 'next-auth/react'
import { ReactElement } from 'react'

import ExternalLink from '../shared/ExternalLink/ExternalLink'
import PageTitle from '../shared/PageTitle/PageTitle'

export default function Connexion({ idProvider }: Props): ReactElement {
  return (
    <div className="fr-container fr-container--fluid">
      <div className="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
          <PageTitle>
            Connexion à la suite gestionnaire numérique
          </PageTitle>
          <div className="fr-mb-6v">
            <h2>
              Se connecter avec ProConnect
            </h2>
            <div className="fr-connect-group">
              <button
                className="fr-connect"
                onClick={async () => signIn(idProvider, { callbackUrl: '/' })}
                title="S’identifier avec ProConnect"
                type="button"
              >
                <span className="fr-connect__login">
                  S’identifier avec
                </span>
                <span className="fr-connect__brand">
                  ProConnect
                </span>
              </button>
              <p>
                <ExternalLink
                  href="https://www.proconnect.gouv.fr/"
                  title="Qu’est-ce que ProConnect ?"
                >
                  Qu’est ce que ProConnect ?
                </ExternalLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  idProvider: string
}>
