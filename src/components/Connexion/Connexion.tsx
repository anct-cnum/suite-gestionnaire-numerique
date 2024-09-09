'use client'

import { signIn } from 'next-auth/react'
import { ReactElement } from 'react'

import ProConnect from './pro-connect.svg'
import { ProConnectProvider } from '@/gateways/ProConnectAuthentificationGateway'

export default function Connexion({ provider }: ConnexionProps): ReactElement {
  return (
    <div className="fr-container fr-container--fluid">
      <div className="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
          <h1>
            Connexion à la suite gestionnaire numérique
          </h1>
          <div className="fr-mb-6v">
            <h2>
              Se connecter avec ProConnect
            </h2>
            <div className="fr-connect-group">
              <button
                className="btn btn--plain btn--primary"
                onClick={async () => signIn(provider.id, { callbackUrl: '/' })}
                title="S’identifier avec ProConnect"
                type="button"
              >
                <ProConnect />
              </button>
              <p>
                <a
                  href="/"
                  rel="external noopener noreferrer"
                  target="_blank"
                  title="Qu’est ce que ProConnect ? (nouvelle fenêtre)"
                >
                  Qu’est ce que ProConnect ?
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type ConnexionProps = Readonly<{
  provider: ProConnectProvider['pro-connect']
}>
