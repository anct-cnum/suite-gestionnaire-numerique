'use client'

import Image from 'next/image'
import { ReactElement } from 'react'

import GraphiqueDemiCercle from '@/components/GraphiqueDemiCercle/GraphiqueDemiCercle'
import LieuxInclusionCategory from '@/components/LieuxInclusion/LieuxInclusionCategory'
import LieuxInclusionHearder from '@/components/LieuxInclusion/LieuxInclusionHeader'
import { LieuxInclusionNumeriqueViewModel } from '@/presenters/lieuxInclusionNumeriquePresenter'

export default function LieuxInclusion(props: Props): ReactElement {
  const { viewModel } = props

  return (
    <div className="fr-mt-4w">
      <LieuxInclusionHearder />
      <LieuxInclusionCategory
        dateGeneration={viewModel.categoryGenerationDate}
        elements={viewModel.categoryElements}
        nombreLieuxInclusion={viewModel.nombreLieuxInclusion}
        nombreLieuxInclusionPublic={viewModel.nombreLieuxInclusionPublic}
      />
      <div className="fr-grid-row ">
        <div className="fr-col-12 fr-col-md-6 fr-pr-1w"  >
          <GraphiqueDemiCercle
            /* eslint-disable-next-line no-restricted-syntax */
            dateGeneration={new Date()}
            details={[
              { backgroundColor: 'dot-purple-glycine-main-494', label: 'En quartier prioritaire de la ville (QPV)', value: viewModel.territoriesQPV },
              { backgroundColor: 'dot-purple-glycine-850-200', label: 'En zone France Ruralités Revitalisation (FRR)', value: viewModel.territoriesFRR },
            ]}
            graphiqueInfos={[
              { backgroundColor: '#a558a0', label: 'En quartier prioritaire de la ville (QPV)', value: viewModel.territoriesQPV },
              { backgroundColor: '#fbb8f6', label: 'En zone France Ruralités Revitalisation (FRR)', value: viewModel.territoriesFRR },
            ]}
            indicateur={viewModel.territoriesPrioritaires}
            label="Lieux en territoires prioritaires"
          />
        </div>
        <div className="fr-col-12 fr-col-md-6 fr-pl-1w"  >
          <GraphiqueDemiCercle
            /* eslint-disable-next-line no-restricted-syntax */
            dateGeneration={new Date()}
            details={[
              { backgroundColor: 'dot-green-emeraude-main-632', label: 'Lieux accueillant des conseillers numérique', value: viewModel.lieuxConseillerNumeriques },
              { backgroundColor: 'dot-green-menthe-main-548', label: 'Points d’accueil labellisés France services', value: viewModel.lieuxFranceService },
            ]}
            graphiqueInfos={[
              { backgroundColor: '#00a95f', label: 'Lieux accueillant des conseillers numérique', value: viewModel.lieuxConseillerNumeriques },
              { backgroundColor: '#009081', label: 'Points d’accueil labellisés France services', value: viewModel.lieuxFranceService },
            ]}
            indicateur={viewModel.nombreLabellisesOuHabilites}
            label="Lieux labellisés ou habilités"
          />
        </div>
      </div>
      <div
        className="fr-grid-row  fr-mb-4w fr-border-default--grey"
        style={{ borderRadius: '1rem', height: '20rem' }}
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

type Props = Readonly<{
  viewModel : LieuxInclusionNumeriqueViewModel
}>
