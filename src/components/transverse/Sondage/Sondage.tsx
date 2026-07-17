'use client'

import { usePathname } from 'next/navigation'
import { ReactElement } from 'react'

import styles from './Sondage.module.css'
import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'
import Icon from '@/components/shared/Icon/Icon'

export default function Sondage(): null | ReactElement {
  const pathname = usePathname()

  if (pathname !== '/tableau-de-bord') {
    return null
  }

  return (
    <div className={`fr-notice border-radius ${styles.background}`}>
      <p className="center">
        <Icon classname="fr-text--lead" icon="flashlight-fill" />
        <strong>Aidez-nous à améliorer Mon inclusion Numérique</strong> : Répondez à notre sondage en 5 min.{' '}
        <ExternalLink className="fr-link" href="https://tally.so/r/pbLzdV" title="Cliquez-ici">
          Cliquez-ici
        </ExternalLink>
      </p>
    </div>
  )
}
