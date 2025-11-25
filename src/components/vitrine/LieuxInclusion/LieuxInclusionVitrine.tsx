'use client'

import Image from 'next/image'
import { ReactElement } from 'react'

import GraphiqueDemiCercle from '@/components/GraphiqueDemiCercle/GraphiqueDemiCercle'
import LieuxInclusionCategory from '@/components/LieuxInclusion/LieuxInclusionCategory'
import SectionSources from '@/components/vitrine/SyntheseEtIndicateurs/SectionSources'
import { LieuxInclusionNumeriqueViewModel } from '@/presenters/lieuxInclusionNumeriquePresenter'

export default function LieuxInclusionVitrine({ viewModel }: Props): ReactElement {
  return (
    <div className="fr-pr-10w">
      <div className="fr-mb-10w">
        <div className="fr-mb-1w">
          <div style={{ alignItems: 'center', display: 'flex', gap: '10px', justifyContent: 'center', minHeight: '40px' }}>
            <h3
              className="fr-mb-0"
              style={{
                color: '#000091',
                flex: 1,
                fontSize: '24px',
                fontWeight: 700,
                lineHeight: '32px',
              }}
            >
              Données et statistiques
            </h3>
            <button
              className="fr-btn fr-btn--tertiary fr-btn--icon-left fr-icon-download-line"
              type="button"
            >
              Exporter
            </button>
          </div>
        </div>
        <p
          className="fr-mb-0"
          style={{
            color: '#666666',
            flex: 1,
            fontSize: '12px',
            lineHeight: '16px',
          }}
        >
          Données mise à jour le 01/11/24
        </p>
      </div>

      <LieuxInclusionCategory
        dateGeneration={viewModel.categoryGenerationDate}
        elements={viewModel.categoryElements}
        nombreLieuxInclusion={viewModel.nombreLieuxInclusion}
        nombreLieuxInclusionPublic={viewModel.nombreLieuxInclusionPublic}
      />

      <div className="fr-grid-row">
        <div className="fr-col-12 fr-col-md-6 fr-pr-1w">
          <GraphiqueDemiCercle
            dateGeneration={viewModel.categoryGenerationDate}
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
        <div className="fr-col-12 fr-col-md-6 fr-pl-1w">
          <GraphiqueDemiCercle
            dateGeneration={viewModel.categoryGenerationDate}
            details={[
              { backgroundColor: 'dot-green-emeraude-main-632', label: 'Lieux accueillant des conseillers numériques', value: viewModel.lieuxConseillerNumeriques },
              { backgroundColor: 'dot-green-menthe-main-548', label: 'Points d\'accueil labellisés France services', value: viewModel.lieuxFranceService },
            ]}
            graphiqueInfos={[
              { backgroundColor: '#00a95f', label: 'Lieux accueillant des conseillers numériques', value: viewModel.lieuxConseillerNumeriques },
              { backgroundColor: '#009081', label: 'Points d\'accueil labellisés France services', value: viewModel.lieuxFranceService },
            ]}
            indicateur={viewModel.nombreLabellisesOuHabilites}
            information="Un lieu peut accueillir des médiateurs de plusieurs dispositifs, il est alors comptabilisé dans chaque catégorie"
            label="Lieux labellisés ou habilités"
          />
        </div>
      </div>

      <div
        className="fr-grid-row fr-mb-4w fr-border-default--grey"
        style={{ borderRadius: '1rem', height: '20rem' }}
      >
        <div
          className="fr-col-12 fr-col-md-6 fr-pr-1w"
          style={{ borderRadius: '1rem', position: 'relative' }}
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

      <SectionSources />
    </div>
  )
}

type Props = Readonly<{
  viewModel: LieuxInclusionNumeriqueViewModel
}>
