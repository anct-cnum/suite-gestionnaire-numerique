import Script from 'next/script'
import { PropsWithChildren, ReactElement } from 'react'

import 'react-toastify/dist/ReactToastify.css'
import '@gouvfr/dsfr/dist/dsfr.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-buildings/icons-buildings.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-business/icons-business.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-communication/icons-communication.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-design/icons-design.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-device/icons-device.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-document/icons-document.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-map/icons-map.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-media/icons-media.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-system/icons-system.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-user/icons-user.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-weather/icons-weather.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-editor/icons-editor.min.css'
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
          src="/dsfr-1.13.0.module.min.js"
          strategy="lazyOnload"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
