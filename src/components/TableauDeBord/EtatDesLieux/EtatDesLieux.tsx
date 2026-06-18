'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import AccompagnementsRealises from './AccompagnementsRealises'
import AccompagnementsRealisesClient from './AccompagnementsRealisesClient'
import styles from './CarteFragilite.module.css'
import LieuxInclusionNumerique from './LieuxInclusionNumerique'
import MediateursEtAidants from './MediateursEtAidants'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { LieuxInclusionNumeriqueViewModel } from '@/presenters/tableauDeBord/lieuxInclusionNumeriquePresenter'
import { MediateursEtAidantsViewModel } from '@/presenters/tableauDeBord/mediateursEtAidantsPresenter'
import { AccompagnementsRealisesResult } from '@/use-cases/queries/fetchAccompagnementsRealises'

export default function EtatDesLieux(props: EtatDesLieuxProps): ReactElement {
  const { afficherLienLieux = true, carte, lieuxInclusionViewModel, mediateursEtAidantsViewModel } = props
  let accompagnements: ReactElement
  if ('accompagnementsTerritoire' in props) {
    accompagnements = <AccompagnementsRealisesClient territoire={props.accompagnementsTerritoire} />
  } else if ('accompagnementsStructureId' in props) {
    accompagnements = <AccompagnementsRealisesClient structureId={props.accompagnementsStructureId} />
  } else {
    accompagnements = <AccompagnementsRealises accompagnementsRealisesPromise={props.accompagnementsRealisesPromise} />
  }

  return (
    <section aria-labelledby="etatDesLieux" className="fr-mb-4w ">
      <div className="fr-grid-row fr-grid-row--middle fr-pb-2w">
        <div className="fr-col-auto" style={{ alignItems: 'stretch', display: 'flex' }}>
          <TitleIcon icon="france-line" size="medium-large" />
        </div>
        <div className="fr-col">
          <div
            className="fr-mb-1w"
            style={{
              alignItems: 'center',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'space-between',
            }}
          >
            <h2 className="fr-h4 color-blue-france fr-m-0" id="etatDesLieux">
              État des lieux de l&apos;inclusion numérique
            </h2>
            {afficherLienLieux ? (
              <Link
                className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
                href="/lieux-inclusion"
              >
                Lieux d&apos;inclusion numérique
              </Link>
            ) : null}
          </div>
          <p className="fr-m-0 font-weight-500">Données cumulées de tous les dispositifs d&apos;inclusion numérique</p>
        </div>
      </div>
      <div className="fr-grid-row">
        {carte}
        <div className={`fr-col-12 fr-col-xl-4 ${styles.cardsColumn}`}>
          <LieuxInclusionNumerique viewModel={lieuxInclusionViewModel} />
          <MediateursEtAidants viewModel={mediateursEtAidantsViewModel} />
          {accompagnements}
        </div>
      </div>
    </section>
  )
}

type EtatDesLieuxProps = (
  | Readonly<{ accompagnementsRealisesPromise: Promise<AccompagnementsRealisesResult | ErrorViewModel> }>
  | Readonly<{ accompagnementsStructureId: number }>
  | Readonly<{ accompagnementsTerritoire: string }>
) &
  Readonly<{
    afficherLienLieux?: boolean
    carte: ReactElement
    lieuxInclusionViewModel: ErrorViewModel | LieuxInclusionNumeriqueViewModel
    mediateursEtAidantsViewModel: ErrorViewModel | MediateursEtAidantsViewModel
  }>
