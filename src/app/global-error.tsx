'use client'

import { captureException } from '@sentry/nextjs'
import { ReactElement, useEffect } from 'react'

export default function GlobalError({ error, reset }: ErrorProps): ReactElement {
  useEffect(() => {
    captureException(error)
  }, [error])

  return (
    <html
      dir="ltr"
      lang="fr"
    >
      <body>
        <p>
          Message d’erreur :
          {' '}
          {error.message}
          <br />
          Digest :
          {' '}
          {error.digest}
        </p>
        <button
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </body>
    </html>
  )
}

type ErrorProps = Readonly<{
  error: Error & { digest?: string }
  reset(): void
}>
