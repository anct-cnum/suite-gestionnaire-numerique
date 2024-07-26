'use client'

import Script from 'next/script'
import { PropsWithChildren, ReactElement, useMemo, useState } from 'react'

import '@gouvfr/dsfr/dist/core/core.min.css'

import { sessionUtilisateurContext } from '../components/shared/session-utilisateur-context'
import EnTete from '@/components/shared/EnTete/EnTete'
import LienEvitement from '@/components/shared/LienEvitement/LienEvitement'
import PiedDePage from '@/components/shared/PiedDePage/PiedDePage'
import SelecteurRole from '@/components/shared/SelecteurRole/SelecteurRole'
import { SessionUtilisateurViewModel, sessionUtilisateurNonAuthentifie, isUtilisateurAuthentifie } from '@/components/shared/SelecteurRole/session-utilisateur-presenter'

export default function Layout({ children }: PropsWithChildren): ReactElement {
  const [session, setSession] = useState<SessionUtilisateurViewModel>(sessionUtilisateurNonAuthentifie)
  const sessionUtilisateurContextProvider = useMemo(() => ({ session, setSession }), [session, setSession])
  return (
    <html
      dir="ltr"
      lang="fr"
    >
      <head>
        <meta
          content="IE=edge"
          httpEquiv="X-UA-Compatible"
        />
        <meta
          content="width=device-width,initial-scale=1"
          name="viewport"
        />
        <link
          href="./favicon.ico"
          rel="shortcut icon"
          type="image/x-icon"
        />
        <Script
          src="/dsfr-1.5.0.nomodule.min.js"
          strategy="lazyOnload"
        />
      </head>
      <body>
        <LienEvitement />
        <sessionUtilisateurContext.Provider value={sessionUtilisateurContextProvider}>
          {isUtilisateurAuthentifie(session) ? <EnTete /> : <SelecteurRole />}
        </sessionUtilisateurContext.Provider>
        <main
          className="fr-container fr-pt-3w"
          id="content"
        >
          {children}
        </main>
        <PiedDePage />
      </body>
    </html>
  )
}
