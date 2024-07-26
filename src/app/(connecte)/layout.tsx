'use client'

import { useRouter } from 'next/navigation'
import { PropsWithChildren, ReactElement, useContext } from 'react'

import '@gouvfr/dsfr/dist/core/core.min.css'

import EnTete from '@/components/shared/EnTete/EnTete'
import LienEvitement from '@/components/shared/LienEvitement/LienEvitement'
import PiedDePage from '@/components/shared/PiedDePage/PiedDePage'
import { isUtilisateurAuthentifie } from '@/components/shared/SelecteurRole/session-utilisateur-presenter'
import { sessionUtilisateurContext } from '@/components/shared/SessionUtilisateurContext'

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
