import { redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'

import EnTete from '@/components/transverse/EnTete/EnTete'
import LienEvitement from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'
import { amIConnected } from '@/gateways/ProConnectAuthentificationGateway'

export default async function Layout({ children }: PropsWithChildren): Promise<ReactElement> {
  if (!await amIConnected()) {
    redirect('/connexion')
  }

  return (
    <>
      <LienEvitement />
      <EnTete />
      <main
        className="fr-container fr-pt-3w"
        id="content"
      >
        {children}
      </main>
      <PiedDePage />
    </>
  )
}
