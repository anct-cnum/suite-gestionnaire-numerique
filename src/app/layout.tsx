import Script from 'next/script'
import { PropsWithChildren, ReactElement } from 'react'

import '@gouvfr/dsfr/dist/core/core.min.css'

import SessionUtilisateurContext from '../components/shared/SessionUtilisateurContext'

export default function Layout({ children }: PropsWithChildren): ReactElement {
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
          src="/dsfr-1.12.1.module.min.js"
          strategy="lazyOnload"
        />
      </head>
      <body>
        <SessionUtilisateurContext>
          {children}
        </SessionUtilisateurContext>
      </body>
    </html>
  )
}
