'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import HistoriqueEvenements from '../shared/HistoriqueEvenements/HistoriqueEvenements'
import PageTitle from '../shared/PageTitle/PageTitle'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { StructureHistoriqueViewModel } from '@/presenters/structureHistoriquePresenter'

export default function StructureEmployeuseHistorique({ structureId, viewModel }: Props): ReactElement {
  return (
    <div className="fr-container fr-py-4w">
      <Link className="fr-link fr-icon-arrow-left-line fr-link--icon-left fr-mb-3w" href={`/structure/${structureId}`}>
        Retour au détail de la structure
      </Link>
      <PageTitle>
        <TitleIcon icon="time-line" />
        Historique — {viewModel.denomination}
      </PageTitle>
      <HistoriqueEvenements
        evenements={viewModel.evenements}
        sourcesPivots={viewModel.sourcesPivots}
        texteVide="Aucun événement enregistré pour cette structure."
      />
    </div>
  )
}

type Props = Readonly<{
  structureId: string
  viewModel: StructureHistoriqueViewModel
}>
