'use client'

import Script from 'next/script'
import { ReactElement } from 'react'

export default function Dsfr(): ReactElement {
  return (
    <Script
      src="/dsfr/dsfr.module.min.js"
      strategy="lazyOnload"
    />
  )
}
