'use client'

import { ReactElement } from 'react'

import MetriqueGouvernanceCard from './MetriqueGouvernanceCard'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { FeuillesDeRouteDeposeesViewModel } from '@/presenters/tableauDeBord/feuillesDeRouteDeposeesPresenter'

export default function FeuillesDeRouteDeposees({ dateGeneration, feuillesDeRouteDeposees }: Props): ReactElement {
  if (isErrorViewModel(feuillesDeRouteDeposees)) {
    return (
      <MetriqueGouvernanceCard
        ariaId="feuilles-de-route-deposees"
        dateGeneration={dateGeneration}
        downloadFilename="feuilles-de-route-deposees.png"
        downloadTitle="Feuilles de route"
        error={feuillesDeRouteDeposees.message}
      />
    )
  }

  const items = feuillesDeRouteDeposees.ventilationParPerimetre.map((item) => ({
    backgroundColor: item.backgroundColor,
    color: item.color,
    count: item.count,
    hideFromList: item.perimetre === 'Autre',
    label: item.perimetre,
  }))

  return (
    <MetriqueGouvernanceCard
      ariaId="feuilles-de-route-deposees"
      dateGeneration={dateGeneration}
      downloadFilename="feuilles-de-route-deposees.png"
      downloadTitle="Feuilles de route"
      items={items}
      nombreTotal={feuillesDeRouteDeposees.nombreTotal}
      subtitle={
        <>
          dont <strong>{feuillesDeRouteDeposees.nombreAvecDemandeSubvention} avec demandes de subvention</strong>
        </>
      }
      title="Feuilles de route"
    />
  )
}

function isErrorViewModel(viewModel: ErrorViewModel | FeuillesDeRouteDeposeesViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  dateGeneration: Date
  feuillesDeRouteDeposees: ErrorViewModel | FeuillesDeRouteDeposeesViewModel
}>
