'use client'
import React, { ReactElement, useRef } from 'react'

import Information from '../shared/Information/Information'
import { DownloadButton } from '@/components/shared/Download/DownloadButton'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'
import { handleDownload } from '@/shared/DownloadHelp'

export default function LieuxInclusionCategory(props: Props): ReactElement {
  const { nombreLieuxInclusion } = props
  const divCard = useRef<HTMLDivElement>(null)
  return (
    <section className="fr-p-3w fr-mb-2w fr-border-default--grey" style={{ borderRadius: '1rem' }}>
      <div className="fr-card fr-card--no-border fr-p-1w" ref={divCard}>
        <div className="fr-grid-row fr-grid-row--middle">
          <div className="fr-col">
            <div className="fr-col-auto" style={{ alignItems: 'stretch', display: 'flex' }}>
              <TitleIcon icon="map-pin-2-line" />
            </div>
            <p className="fr-display--lg fr-text--bold fr-mb-1v">{nombreLieuxInclusion}</p>
            Lieux d&apos;inclusion numérique
            <Information>
              <p className="fr-mb-0">
                Nombre de lieux affichés sur la <strong>cartographie nationale</strong> des lieux d&apos;inclusion
                numérique
              </p>
            </Information>
          </div>
          <div className="fr-col-auto">
            <DownloadButton
              onClick={() => {
                void handleDownload(divCard, 'Lieux d’inclusion numérique')
              }}
              title="Lieux d’inclusion numérique"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

type Props = Readonly<{
  nombreLieuxInclusion: number
}>
