import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    typedRoutes: true,
  },
  output: 'export',
  poweredByHeader: false,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
}

const SentryBuildOptions = {
  disableLogger: true,
  hideSourceMaps: true,
  silent: true,
  widenClientFileUpload: true,
}

export default withSentryConfig(nextConfig, SentryBuildOptions)
