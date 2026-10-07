'use client'

import { usePathname } from 'next/navigation'
import { ReactElement } from 'react'

import styles from './BandeauAnnonce.module.css'
import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'

export default function BandeauAnnonce(): null | ReactElement {
  const pathname = usePathname()

  if (!pathname.startsWith('/tableau-de-bord')) {
    return null
  }

  return (
    <div className={`fr-notice border-radius ${styles.background}`}>
      <p className="center">
        <span aria-hidden="true">🆕</span> <strong>Découvrez les nouveautés</strong> : statistiques, espace structures
        et lieux d’inclusion.{' '}
        <ExternalLink
          className="fr-link"
          href="https://docs.numerique.gouv.fr/docs/0943e42c-a300-4d90-95f2-4cbb4382b8fb"
          title="Cliquez-ici pour consulter le document présentant les nouveautés"
        >
          Cliquez-ici<span className="fr-sr-only"> pour consulter le document présentant les nouveautés</span>
        </ExternalLink>
      </p>
    </div>
  )
}
