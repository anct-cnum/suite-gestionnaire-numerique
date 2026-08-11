import { Metadata } from 'next'
import { getProviders } from 'next-auth/react'
import { ReactElement } from 'react'

import ConnexionLabel from '@/components/ConnexionLabel/ConnexionLabel'
import { ProConnectProvider } from '@/gateways/NextAuthAuthentificationGateway'

export const metadata: Metadata = {
  title: 'Se connecter',
}

// Forcer le rendu dynamique pour éviter les appels API à la compilation
export const dynamic = 'force-dynamic'

export default async function ConnexionLabelController(): Promise<ReactElement> {
  const providers = (await getProviders()) as unknown as ProConnectProvider

  return <ConnexionLabel idProvider={providers['pro-connect'].id} />
}
