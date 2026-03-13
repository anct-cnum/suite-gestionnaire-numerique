import Script from 'next/script'
import { PropsWithChildren, ReactElement } from 'react'

import 'react-toastify/dist/ReactToastify.css'
import '@gouvfr/dsfr/dist/dsfr.min.css'
import '@gouvfr/dsfr/dist/utility/utility.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons.css'
import 'remixicon/fonts/remixicon.css'
import '../global.css'

import Dsfr from './Dsfr'

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
        <Dsfr />
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
