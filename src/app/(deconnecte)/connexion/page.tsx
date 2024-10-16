import { Metadata } from 'next'
import { getProviders } from 'next-auth/react'
import { ReactElement } from 'react'

import Connexion from '@/components/Connexion/Connexion'
import { ProConnectProvider } from '@/gateways/ProConnectAuthentificationGateway'

export const metadata: Metadata = {
  title: 'Se connecter',
}

export default async function ConnexionController(): Promise<ReactElement> {
  const providers = await getProviders() as unknown as ProConnectProvider

  return (
    <Connexion idProvider={providers['pro-connect'].id} />
  )
}
