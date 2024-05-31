import Script from 'next/script'
import { PropsWithChildren, ReactElement } from 'react'

import EnTete from '@/components/shared/EnTete/EnTete'
import LienEvitement from '@/components/shared/LienEvitement/LienEvitement'
import PiedDePage from '@/components/shared/PiedDePage/PiedDePage'
import '@gouvfr/dsfr/dist/core/core.min.css'

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
          src="/dsfr-1.5.0.nomodule.min.js"
          strategy="lazyOnload"
        />
      </head>
      <body>
        <LienEvitement />
        <EnTete />
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
