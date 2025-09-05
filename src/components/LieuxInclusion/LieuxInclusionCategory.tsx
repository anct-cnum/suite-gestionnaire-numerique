'use client'
import React, { ReactElement, useRef } from 'react'

import { DownloadButton } from '@/components/shared/Download/DownloadButton'
import GraphiqueBarList from '@/components/shared/GraphiqueBarList/GraphiqueBarList'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'
import { handleDownload } from '@/shared/DownloadHelp'

export default function LieuxInclusionCategory(props : Props): ReactElement {
  const { dateGeneration, elements, nombreLieuxInclusion, nombreLieuxInclusionPublic } = props
  const divCard = useRef<HTMLDivElement>(null)
  return (
    <section
      className="fr-p-3w fr-mb-2w fr-border-default--grey"
      style={{ borderRadius: '1rem' }}
    >
      <div
        className="fr-card fr-card--no-border fr-p-1w"
        ref={divCard}
      >
        <div className="fr-grid-row">
          <div className="fr-col-12 fr-col-md-6 " >
            <div
              className="fr-col-auto"
              style={{ alignItems: 'stretch', display: 'flex' }}
            >
              <TitleIcon icon="map-pin-2-line" />
            </div>
            <p className="fr-display--lg fr-text--bold fr-mb-1v">
              {nombreLieuxInclusion}
            </p>
            <p className="fr-text--xl fr-text--bold fr-mb-1v fr-text-default--grey">
              Lieux d’inclusion numérique
            </p>
            <p className="fr-text--sm fr-mb-0 fr-text-label--blue-france">
              dont
              {' '}
              {nombreLieuxInclusionPublic}
              {' '}
              dans le secteur public
            </p>
          </div>
          <div
            className="fr-col-12 fr-col-md-6 fr-pl-4w "
            style={{ borderLeftColor: 'var(--grey-900-175)' ,borderLeftStyle: 'solid', borderLeftWidth: '1px' }}
          >
            <div
              className="fr-text--bold  fr-mb-1w fr-text--sm"
            >
              Dont
            </div>
            <GraphiqueBarList elements={elements} />
            <hr className="fr-hr fr-mt-2w" />
            <div
              className="fr-grid-row fr-grid-row--middle "
              style={{ alignItems: 'center' }}
            >
              <div style={{ display: 'none',  flex: 1  }}>
                <p className="fr-text--sm fr-mb-0">
                  Données mises à jour le
                  {' '}
                  {dateGeneration.toLocaleDateString('fr-FR') }
                </p>
              </div>
              <DownloadButton 
                onClick={() => { void handleDownload(divCard,'Lieux d’inclusion numérique')}}
                title="Lieux d’inclusion numérique"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

type Props = Readonly<{
  dateGeneration: Date
  elements : Array<{ label: string; value: number }>
  nombreLieuxInclusion: number
  nombreLieuxInclusionPublic: number
}>
