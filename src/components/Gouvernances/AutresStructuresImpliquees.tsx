'use client'

import { ReactElement } from 'react'

import MetriqueGouvernanceCard from './MetriqueGouvernanceCard'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AutresStructuresViewModel } from '@/presenters/tableauDeBord/autresStructuresImpliquéesPresenter'

export default function AutresStructuresImpliquees({ autresStructures, dateGeneration }: Props): ReactElement {
  if (isErrorViewModel(autresStructures)) {
    return (
      <MetriqueGouvernanceCard
        ariaId="autres-structures-impliquees"
        dateGeneration={dateGeneration}
        downloadFilename="autres-structures-impliquees.png"
        downloadTitle="Autres structures impliquées"
        error={autresStructures.message}
      />
    )
  }

  const items = autresStructures.ventilation.map((item) => ({
    backgroundColor: item.backgroundColor,
    color: item.color,
    count: item.count,
    label: item.categorie,
  }))

  return (
    <MetriqueGouvernanceCard
      ariaId="autres-structures-impliquees"
      dateGeneration={dateGeneration}
      downloadFilename="autres-structures-impliquees.png"
      downloadTitle="Autres structures impliquées"
      items={items}
      nombreTotal={autresStructures.nombreTotal}
      subtitle={
        <>
          dont <strong>{autresStructures.nombreCoporteurs} membres coporteurs</strong>
        </>
      }
      title={
        <>
          Autres structures impliquées
          <br />
          dans la gouvernance
        </>
      }
    />
  )
}

function isErrorViewModel(viewModel: AutresStructuresViewModel | ErrorViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  autresStructures: AutresStructuresViewModel | ErrorViewModel
  dateGeneration: Date
}>
