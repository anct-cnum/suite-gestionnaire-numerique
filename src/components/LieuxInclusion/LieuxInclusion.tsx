'use client'

import Image from 'next/image'
import { ReactElement } from 'react'

import GraphiqueDemiCercle from '@/components/GraphiqueDemiCercle/GraphiqueDemiCercle'
import LieuxInclusionCategory from '@/components/LieuxInclusion/LieuxInclusionCategory'
import LieuxInclusionHearder from '@/components/LieuxInclusion/LieuxInclusionHeader'

export default function LieuxInclusion(): ReactElement {
  return (
    <div className="fr-mt-4w">
      <LieuxInclusionHearder />
      <LieuxInclusionCategory  />
      <div className="fr-grid-row ">
        <div className="fr-col-12 fr-col-md-6 fr-pr-1w"  >
          <GraphiqueDemiCercle
            /* eslint-disable-next-line no-restricted-syntax */
            dateGeneration={new Date()}
            details={[
              { backgroundColor: '#900073', label: 'En Quartier Prioritaire de la ville', value: 110 },
              { backgroundColor: '#710090', label: 'En Zone France Ruralités Revitailisation', value: 330 },
            ]}
            graphiqueInfos={[
              { backgroundColor: '#900073', label: 'En Quartier Prioritaire de la ville', value: 110 },
              { backgroundColor: '#710090', label: 'En Zone France Ruralités Revitailisation', value: 330 },
            ]}
            indicateur={410}
            label="Lieux en territoires prioritaires"
            /* eslint-disable-next-line @typescript-eslint/no-empty-function */
            onDownloadClick={() => {}}
          />
        </div>
        <div className="fr-col-12 fr-col-md-6 fr-pl-1w"  >
          <GraphiqueDemiCercle
            /* eslint-disable-next-line no-restricted-syntax */
            dateGeneration={new Date()}
            details={[
              { backgroundColor: '#00A95F', label: 'En Quartier Prioritaire de la ville', value: 110 },
              { backgroundColor: '#009081', label: 'En Zone France Ruralités Revitailisation', value: 330 },
            ]}
            graphiqueInfos={[
              { backgroundColor: '#00A95F', label: 'En Quartier Prioritaire de la ville', value: 110 },
              { backgroundColor: '#009081', label: 'En Zone France Ruralités Revitailisation', value: 330 },
            ]}
            indicateur={410}
            label="Lieux labellisés ou habilités"
            /* eslint-disable-next-line @typescript-eslint/no-empty-function */
            onDownloadClick={() => {}}
          />
        </div>
      </div>
      <div
        className="fr-grid-row  fr-mb-4w fr-border-default--grey"
        style={{ borderRadius: '1rem', height: '256px' }}
      >
        <div
          className="fr-col-12 fr-col-md-6 fr-pr-1w"
          style={{ borderRadius: '1rem' , position: 'relative' }}
        >
          <Image
            alt=""
            className="fr-mr-2w"
            fill
            src="/carte-inclusion-numerique.png"
            style={{
              borderBottomLeftRadius: '1rem',
              borderTopLeftRadius: '1rem',
            }}
          />
        </div>
        <div
          className="fr-col-12 fr-col-md-6 fr-pr-1w"
          style={{
            alignItems: 'flex-start',
            backgroundColor: 'var(--success-975-75)',
            borderBottomRightRadius: '1rem',
            borderTopRightRadius: '1rem',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'center',
            padding: '2rem 3rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{ height: 'auto', textAlign: 'start', width: '60%' }}
          >
            <span
              className="fr-h2 fr-text-label--blue-france"
            >
              Voir tous les lieux sur la cartographie
            </span>
          </div>
          <div className="fr-mt-2w">
            <a
              className="fr-btn fr-icon-external-link-line fr-btn--icon-right"
              href="https://cartographie.societenumerique.gouv.fr/cartographie"
              rel="noopener noreferrer"
              target="_blank"
            >
              La cartographie
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

