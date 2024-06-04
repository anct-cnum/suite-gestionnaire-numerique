import { withSentryConfig } from '@sentry/nextjs'

const securityHeaders = [
  /**
   * Content-Security-Policy, see: https://scotthelme.co.uk/content-security-policy-an-introduction/
   * This header define approved sources for content on the site that the browser can load.
   **/
  {
    key: 'Content-Security-Policy',
    value: "default-src https: 'unsafe-inline'; script-src https: 'unsafe-eval' 'unsafe-inline'; style-src https: 'unsafe-inline'; img-src https: data:;",
  },
  /**
   * Permissions-Policy, see: https://scotthelme.co.uk/goodbye-feature-policy-and-hello-permissions-policy/
   * This header provides a mechanism to allow or deny the use of browser features in its own frame, and in content
   * within any <iframe> elements in the document.
   *
   * CHOICE: disable all the features that we are not currently using.
   **/
  {
    key: 'Permissions-Policy',
    value: 'accelerometer=(), camera=(), microphone=(), document-domain=(), gyroscope=(), magnetometer=(), payment=(), usb=(), xr-spatial-tracking=()',
  },
  /**
   * The HTTP Strict-Transport-Security response header (often abbreviated as HSTS) informs browsers that the site
   * should only be accessed using HTTPS, and that any future attempts to access it using HTTP should automatically
   * be converted to HTTPS.
   **/
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  /**
   * Referrer-Policy, see: https://scotthelme.co.uk/a-new-security-header-referrer-policy/
   * This header lets know where the visitor of the site came from. This header allows to control or restrict the amount
   * of information sent to the destination site.
   *
   * CHOICE: the browser will send the full URL to HTTPS requests to the same origin, and will send origin URL
   * when the HTTPS requests are cross-origin.
   **/
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  /**
   * X-Content-Type-Options, see: https://scotthelme.co.uk/hardening-your-http-response-headers/
   * This header prevents the browser from attempting to guess the type of content if the Content-Type header
   * is not explicitly set
   * There is only one value "nosniff"
   **/
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  /**
   * X-Frame-Options, see: https://scotthelme.co.uk/hardening-your-http-response-headers/
   * This header prevents against clickjacking attacks.
   *
   * CHOICE: The value "SAMEORIGIN" allows you to frame your own site
   **/
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    typedRoutes: true,
  },
  headers() {
    return process.env.NODE_ENV !== 'development' ? [
      {
        headers: securityHeaders,
        source: '/:path*',
      },
    ] : []
  },
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
