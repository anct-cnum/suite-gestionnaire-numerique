'use client'

import { ReactElement } from 'react'

import MetriqueGouvernanceCard from './MetriqueGouvernanceCard'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { CollectivitesViewModel } from '@/presenters/tableauDeBord/collectivitesImpliquéesPresenter'

export default function CollectivitesImpliquees({ collectivites, dateGeneration }: Props): ReactElement {
  if (isErrorViewModel(collectivites)) {
    return (
      <MetriqueGouvernanceCard
        ariaId="collectivites-impliquees"
        dateGeneration={dateGeneration}
        downloadFilename="collectivites-impliquees.png"
        downloadTitle="Collectivités impliquées"
        error={collectivites.message}
      />
    )
  }

  const items = collectivites.ventilation.map((item) => ({
    backgroundColor: item.backgroundColor,
    color: item.color,
    count: item.count,
    label: item.categorie,
  }))

  return (
    <MetriqueGouvernanceCard
      ariaId="collectivites-impliquees"
      dateGeneration={dateGeneration}
      downloadFilename="collectivites-impliquees.png"
      downloadTitle="Collectivités impliquées"
      items={items}
      nombreTotal={collectivites.nombreTotal}
      subtitle={
        <>
          dont <strong>{collectivites.nombreCoporteurs} membres coporteurs</strong>
        </>
      }
      title={
        <>
          Collectivités impliquées
          <br />
          dans la gouvernance
        </>
      }
    />
  )
}

function isErrorViewModel(viewModel: CollectivitesViewModel | ErrorViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  collectivites: CollectivitesViewModel | ErrorViewModel
  dateGeneration: Date
}>
