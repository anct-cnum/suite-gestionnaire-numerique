'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import AccompagnementsRealises from './AccompagnementsRealises'
import LieuxInclusionNumerique from './LieuxInclusionNumerique'
import MediateursEtAidants from './MediateursEtAidants'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AccompagnementsRealisesViewModel } from '@/presenters/tableauDeBord/accompagnementsRealisesPresenter'
import { LieuxInclusionNumeriqueViewModel } from '@/presenters/tableauDeBord/lieuxInclusionNumeriquePresenter'
import { MediateursEtAidantsViewModel } from '@/presenters/tableauDeBord/mediateursEtAidantsPresenter'

export default function EtatDesLieux({
  accompagnementsRealisesViewModel,
  carte,
  lieuxInclusionViewModel,
  mediateursEtAidantsViewModel,
}: EtatDesLieuxProps): ReactElement {
  return (
    <section
      aria-labelledby="etatDesLieux"
      className="fr-mb-4w "
    >
      <div className="fr-grid-row fr-grid-row--middle fr-pb-2w">
        <div
          className="fr-col-auto"
          style={{ alignItems: 'stretch', display: 'flex' }}
        >
          <TitleIcon icon="france-line" />
        </div>
        <div className="fr-col fr-grid-row fr-grid-row--middle">
          <div>
            <div
              className="fr-mb-1w"
              style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}
            >
              <h2
                className="fr-h4 color-blue-france fr-m-0"
                id="etatDesLieux"
              >
                État des lieux de l&apos;inclusion numérique
              </h2>
              <Link
                className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
                href="/lieux-inclusion"
              >
                Lieux d&apos;inclusion numérique
              </Link>
            </div>
            <div>
              <p className="fr-m-0 font-weight-500">
                Source de données : Conseiller numérique, La Coop,
                Cartographie nationale des lieux d&apos;inclusion numérique, Aidants Connect,
                France Services
              </p>
            </div>
          </div>
        </div>

      </div>
      <div className="fr-grid-row">
        {carte}
        <div className="fr-col-4">
          <LieuxInclusionNumerique viewModel={lieuxInclusionViewModel} />
          <MediateursEtAidants viewModel={mediateursEtAidantsViewModel} />
          <AccompagnementsRealises viewModel={accompagnementsRealisesViewModel} />
        </div>
      </div>
    </section>
  )
}

type EtatDesLieuxProps = Readonly<{
  accompagnementsRealisesViewModel: AccompagnementsRealisesViewModel | ErrorViewModel
  carte: ReactElement
  lieuxInclusionViewModel: ErrorViewModel | LieuxInclusionNumeriqueViewModel
  mediateursEtAidantsViewModel: ErrorViewModel | MediateursEtAidantsViewModel
}>
