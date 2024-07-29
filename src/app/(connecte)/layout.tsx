'use client'

import { useRouter } from 'next/navigation'
import { PropsWithChildren, ReactElement, useContext } from 'react'

import { isUtilisateurAuthentifie } from '@/components/shared/SelecteurRole/session-utilisateur-presenter'
import { sessionUtilisateurContext } from '@/components/shared/SessionUtilisateurContext'
import EnTete from '@/components/transverse/EnTete/EnTete'
import LienEvitement from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'

export default function Layout({ children }: PropsWithChildren): ReactElement {
  const router = useRouter()
  const { session } = useContext(sessionUtilisateurContext)

  if (!isUtilisateurAuthentifie(session)) {
    router.push('/connexion')
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
