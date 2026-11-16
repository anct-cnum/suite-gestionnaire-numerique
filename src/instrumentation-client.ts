import * as Sentry from '@sentry/nextjs'

import { tauxDeTraces } from './shared/echantillonnageDesTraces'

Sentry.init({
  debug: false,
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  tracesSampler: ({ name }) => tauxDeTraces(name),
})

// Requis par Sentry 10 pour tracer les navigations App Router
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
