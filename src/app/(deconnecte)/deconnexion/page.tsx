'use client'

import { signOut } from 'next-auth/react'
import { ReactElement, useEffect } from 'react'

export default function DeconnexionPage(): ReactElement {
  useEffect(() => {
    async function deconnexion(): Promise<void> {
      await signOut({ callbackUrl: '/connexion' })
    }
    void deconnexion()
  }, [])

  return (
    <>
    </>
  )
}