'use client'

import { signIn } from 'next-auth/react'
import { ReactElement } from 'react'

import ProConnect from './pro-connect.svg'
import { ProConnectProvider } from '@/gateways/ProConnectAuthentificationGateway'

type ConnexionProps = Readonly<{
  provider: ProConnectProvider['pro-connect']
}>

export default function Connexion({ provider }: ConnexionProps): ReactElement {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <button
        className="btn btn--plain btn--primary"
        onClick={async () => signIn(provider.id, { callbackUrl: '/' })}
        title="S’identifier avec ProConnect"
        type="button"
      >
        <ProConnect />
      </button>
    </div>
  )
}
