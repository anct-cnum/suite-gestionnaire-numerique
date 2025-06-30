import Script from 'next/script'
import { PropsWithChildren, ReactElement } from 'react'

import 'react-toastify/dist/ReactToastify.css'
import '@gouvfr/dsfr/dist/dsfr.min.css'
import '@gouvfr/dsfr/dist/utility/utility.css'
import '@gouvfr/dsfr/dist/utility/icons/icons.css'
import '../global.css'

export default function Layout({ children }: Readonly<PropsWithChildren>): ReactElement {
  return (
    <html
      data-fr-scheme="light"
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
          href={`${process.env.NEXT_PUBLIC_HOST}/favicon.ico`}
          rel="shortcut icon"
          type="image/x-icon"
        />
        <Script
          src="/dsfr-1.13.1.module.min.js"
          strategy="lazyOnload"
        />
        {
          process.env.NODE_ENV === 'production' ? (
            <Script
              src="/matomo-v1.js"
              strategy="lazyOnload"
            />
          ) : null
        }
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
