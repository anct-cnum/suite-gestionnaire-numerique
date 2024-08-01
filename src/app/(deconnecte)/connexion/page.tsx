import { Metadata } from 'next'
import { getProviders } from 'next-auth/react'
import { ReactElement } from 'react'

import Connexion from '@/components/Connexion/Connexion'
import { ProConnectProvider } from '@/gateways/ProConnectAuthentificationGateway'

const title = 'Se connecter'
export const metadata: Metadata = {
  title,
}

export default async function PageConnexion(): Promise<ReactElement> {
  const providers = await getProviders() as unknown as ProConnectProvider

  return (
    <Connexion provider={providers['pro-connect']} />
  )
}
