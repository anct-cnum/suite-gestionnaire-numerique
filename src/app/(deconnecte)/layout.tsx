import { redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'

import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'

export default async function Layout({ children }: PropsWithChildren): Promise<ReactElement> {
  const session = await getSession()

  if (session) {
    redirect('/')
  }

  return (
    <>
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
