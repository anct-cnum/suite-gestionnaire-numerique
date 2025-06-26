'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import AccompagnementsRealises from './AccompagnementsRealises'
import CarteFragilite from './CarteFragilite'
import LieuxInclusionNumerique from './LieuxInclusionNumerique'
import MediateursEtAidants from './MediateursEtAidants'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AccompagnementsRealisesViewModel } from '@/presenters/tableauDeBord/accompagnementsRealisesPresenter'
import { CommuneFragilite } from '@/presenters/tableauDeBord/indiceFragilitePresenter'
import { LieuxInclusionNumeriqueViewModel } from '@/presenters/tableauDeBord/lieuxInclusionNumeriquePresenter'
import { MediateursEtAidantsViewModel } from '@/presenters/tableauDeBord/mediateursEtAidantsPresenter'

export default function EtatDesLieux({
  accompagnementsRealisesViewModel,
  departement,
  indicesFragilite,
  lieuxInclusionViewModel,
  mediateursEtAidantsViewModel,
}: EtatDesLieuxProps): ReactElement {
  return (
    <section
      aria-labelledby="etatDesLieux"
      className="fr-mb-4w "
    >
      <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-2w">
        <div className="fr-grid-row fr-grid-row--middle">
          <TitleIcon icon="france-line" />
          <div>
            <h2
              className="fr-h4 color-blue-france fr-m-0"
              id="etatDesLieux"
            >
              État des lieux de l&apos;inclusion numérique
            </h2>
            <p className="fr-m-0 font-weight-500">
              Données cumulées des dispositifs : Conseillers Numériques et Aidants Connect
            </p>
          </div>
        </div>
        <Link
          className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
          href="/lieux-inclusion"
        >
          Lieux d&apos;inclusion numérique
        </Link>
      </div>
      <div className="fr-grid-row">
        <CarteFragilite
          communesFragilite={indicesFragilite}
          departement={departement}
        />
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
  departement: string
  indicesFragilite: Array<CommuneFragilite> | ErrorViewModel
  lieuxInclusionViewModel: ErrorViewModel | LieuxInclusionNumeriqueViewModel
  mediateursEtAidantsViewModel: ErrorViewModel | MediateursEtAidantsViewModel
}> 