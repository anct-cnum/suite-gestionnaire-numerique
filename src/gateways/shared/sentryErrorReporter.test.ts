import * as Sentry from '@sentry/nextjs'
import { describe, expect, it } from 'vitest'

import { reportErreurConnexion } from './sentryErrorReporter'

describe('signalement à Sentry', () => {
  it('signale une panne technique survenue pendant la connexion, que NextAuth avalerait sans trace (#2390)', () => {
    // GIVEN
    const captureException = vi.fn<typeof Sentry.captureException>()
    const panne = new Error('permission denied for schema min')

    // WHEN
    reportErreurConnexion(panne, captureException)

    // THEN
    expect(captureException).toHaveBeenCalledWith(panne, {
      tags: {
        location: 'connexion',
        type: 'AUTHENTIFICATION_ERROR',
      },
    })
  })

  it('ne signale pas une personne inconnue de MIN : c’est un refus attendu, pas une panne', () => {
    // GIVEN
    const captureException = vi.fn<typeof Sentry.captureException>()

    // WHEN
    reportErreurConnexion(new Error('Utilisateur non trouvé'), captureException)

    // THEN
    expect(captureException).not.toHaveBeenCalled()
  })
})
