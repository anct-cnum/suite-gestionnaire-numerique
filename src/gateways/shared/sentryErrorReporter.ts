import * as Sentry from '@sentry/nextjs'

export function reportLoaderError(
  error: unknown,
  loaderName: string,
  context: Record<string, unknown> = {}
): void {
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