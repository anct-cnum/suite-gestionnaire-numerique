'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import { PointsVigilanceLieuxViewModel } from '@/presenters/tableauDeBord/pointsVigilanceLieuxPresenter'

export default function PointsVigilance({ viewModel }: Props): ReactElement {
  return (
    <section aria-labelledby="pointsVigilanceLieux" className="fr-mb-4w">
      <h2 className="fr-h4 color-blue-france fr-mb-2w" id="pointsVigilanceLieux">
        Points de vigilance des lieux d’inclusion numérique
      </h2>
      <div
        style={{
          backgroundColor: 'var(--background-alt-blue-france)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '1rem',
        }}
      >
        {viewModel.lignes.map((ligne) => (
          <div
            key={ligne.url}
            style={{
              alignItems: 'center',
              backgroundColor: 'var(--background-default-grey)',
              borderRadius: '4px',
              display: 'flex',
              gap: '1rem',
              padding: '0.75rem 1rem',
            }}
          >
            <p className="fr-m-0 color-blue-france" style={{ flex: '1 1 auto', minWidth: 0 }}>
              {ligne.pastille} <span className="fr-text--bold">{ligne.compteur}</span> {ligne.texte}
            </p>
            <Link className="fr-btn fr-btn--sm" href={ligne.url}>
              Consulter
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

type Props = Readonly<{
  viewModel: PointsVigilanceLieuxViewModel
}>
