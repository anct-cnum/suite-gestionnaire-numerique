import { headers } from 'next/headers'
import Script from 'next/script'
import { PropsWithChildren, ReactElement } from 'react'

import { estSiteVitrine } from '@/shared/estSiteVitrine'

import 'react-toastify/dist/ReactToastify.css'
import '@gouvfr/dsfr/dist/dsfr.min.css'
import '@gouvfr/dsfr/dist/utility/utility.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons.css'
import 'remixicon/fonts/remixicon.css'
import '../global.css'

export default async function Layout({ children }: Readonly<PropsWithChildren>): Promise<ReactElement> {
  const hostname = (await headers()).get('host') ?? ''
  const matomoSiteId = estSiteVitrine(hostname) ? '10' : '27'

  return (
    <html data-fr-scheme="light" dir="ltr" lang="fr">
      <head>
        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        <meta content="width=device-width,initial-scale=1" name="viewport" />
        <link href={`${process.env.NEXT_PUBLIC_HOST}/favicon.ico`} rel="shortcut icon" type="image/x-icon" />
        {process.env.NODE_ENV === 'production' ? (
          <Script src={`/matomo-v1.js?siteId=${matomoSiteId}`} strategy="lazyOnload" />
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  )
}
