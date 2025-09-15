'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'

export default function LieuxInclusionHearder(): ReactElement {
  return (
    <section
      aria-labelledby="entete"
      className="fr-pb-2w"
    >
      <div className="fr-grid-row fr-grid-row--middle fr-pb-2w">
        <div
          className="fr-col-auto"
          style={{ alignItems: 'stretch', display: 'flex' }}
        >
          <TitleIcon icon="map-pin-2-line" />
        </div>
        <div className="fr-col fr-grid-row">
          <div>
            <span
              className="fr-h2 fr-text-label--blue-france"
            >
              Lieux d&apos;inclusion numérique
            </span>

          </div>

        </div>
        <Link
          className="fr-btn fr-icon-arrow-right-line fr-btn--icon-right"
          href="/liste-lieux-inclusion"
        >
          Voir tous les lieux d&apos;inclusions
        </Link>
      </div>
      <div>
        <span className="fr-text--sm fr-message">
          Vision globale sur les lieux d’inclusion numérique
        </span>
      </div>
    </section>
  )
}

