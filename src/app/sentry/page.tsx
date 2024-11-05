'use client'

import { startSpan } from '@sentry/nextjs'
import { ReactElement } from 'react'

export default function SentryController(): ReactElement {
  async function generateError(): Promise<void> {
    await startSpan({
      name: 'Example Frontend Span',
      op: 'test',
    }, async () => {
      const res = await fetch('/api/sentry')

      if (!res.ok) {
        throw new Error('Erreur explicite du frontend')
      }
    })
  }

  return (
    <button
      onClick={generateError}
      type="button"
    >
      Générer une erreur
    </button>
  )
}
