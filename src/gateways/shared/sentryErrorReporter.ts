import * as Sentry from '@sentry/nextjs'

export function reportLoaderError(error: unknown, loaderName: string, context: Record<string, unknown> = {}): void {
  Sentry.captureException(error, {
    extra: {
      loaderName,
      ...context,
    },
    tags: {
      loader: loaderName,
      location: 'loader',
      type: 'DATA_RETRIEVAL_ERROR',
    },
  })
}

// NextAuth (v4) avale toute exception levée dans le callback signIn : redirection vers la page d'erreur,
// sans aucun log. On la signale donc nous-mêmes. Une personne inconnue de MIN n'est pas une panne mais
// un refus attendu : elle n'est pas signalée (#2390).
export function reportErreurConnexion(
  error: unknown,
  captureException: typeof Sentry.captureException = Sentry.captureException
): void {
  if (error instanceof Error && error.message === 'Utilisateur non trouvé') {
    return
  }
  captureException(error, {
    tags: {
      location: 'connexion',
      type: 'AUTHENTIFICATION_ERROR',
    },
  })
}
