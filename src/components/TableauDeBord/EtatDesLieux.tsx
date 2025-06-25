'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import AccompagnementsRealises from './EtatDesLieux/AccompagnementsRealises'
import CarteFragilite from './EtatDesLieux/CarteFragilite'
import LieuxInclusionNumerique from './EtatDesLieux/LieuxInclusionNumerique'
import MediateursEtAidants from './EtatDesLieux/MediateursEtAidants'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { AccompagnementsRealisesViewModel } from '@/presenters/accompagnementsRealisesPresenter'
import { CommuneFragilite } from '@/presenters/indiceFragilitePresenter'
import { LieuxInclusionNumeriqueViewModel } from '@/presenters/lieuxInclusionNumeriquePresenter'
import { MediateursEtAidantsViewModel } from '@/presenters/mediateursEtAidantsPresenter'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export default function EtatDesLieux(props: EtatDesLieuxProps): ReactElement {
  return (
    <section
      aria-labelledby="etat-des-lieux"
      className="fr-mb-4w"
    >
      <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-2w">
        <div className="fr-grid-row fr-grid-row--middle">
          <TitleIcon icon="map-pin-2-line" />
          <div>
            <h2
              className="fr-h3 fr-mb-0"
              id="etat-des-lieux"
            >
              État des lieux
            </h2>
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
          communesFragilite={props.communesFragilite}
          departement={props.departement}
        />
        <div className="fr-col-4">
          <LieuxInclusionNumerique viewModel={props.lieuxInclusionViewModel} />
          <MediateursEtAidants viewModel={props.mediateursEtAidantsViewModel} />
          <AccompagnementsRealises viewModel={props.accompagnementsRealisesViewModel} />
        </div>
      </div>
    </section>
  )
}

type EtatDesLieuxProps = Readonly<{
  accompagnementsRealisesViewModel: AccompagnementsRealisesViewModel | ErrorReadModel
  communesFragilite: Array<CommuneFragilite>
  departement: string
  lieuxInclusionViewModel: ErrorReadModel | LieuxInclusionNumeriqueViewModel
  mediateursEtAidantsViewModel: ErrorReadModel | MediateursEtAidantsViewModel
}> 