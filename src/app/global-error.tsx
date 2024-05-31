'use client'

import { captureException } from '@sentry/nextjs'
import Error from 'next/error'
import { ReactElement, useEffect } from 'react'

type ErrorProps = Readonly<{
  error: Readonly<Error>
}>

export default function GlobalError({ error }: ErrorProps): ReactElement {
  useEffect(() => {
    captureException(error)
  }, [error])

  return (
    <html
      dir="ltr"
      lang="fr"
    >
      <body>
        <h1>
          {'Quelque chose s’est mal passé !'}
        </h1>
      </body>
    </html>
  )
}
