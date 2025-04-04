import { redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'

import { getSession } from '@/gateways/NextAuthAuthentificationGateway'

export default async function Layout({ children }: Readonly<PropsWithChildren>): Promise<ReactElement> {
  const session = await getSession()

  if (session) {
    redirect('/')
  }

  return (
    <main>
      {children}
    </main>
  )
}
