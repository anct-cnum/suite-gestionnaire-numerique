import * as Sentry from '@sentry/nextjs'

Sentry.init({
  debug: false,
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  tracesSampleRate: 1,
})

// Requis par Sentry 10 pour tracer les navigations App Router
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
