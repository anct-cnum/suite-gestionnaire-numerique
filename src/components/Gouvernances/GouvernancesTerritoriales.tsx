'use client'

import { ReactElement } from 'react'

import MetriqueGouvernanceCard from './MetriqueGouvernanceCard'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { GouvernancesTerritorialesViewModel } from '@/presenters/tableauDeBord/gouvernancesTerritorialesPresenter'

export default function GouvernancesTerritoriales({ dateGeneration, gouvernancesTerritoriales }: Props): ReactElement {
  if (isErrorViewModel(gouvernancesTerritoriales)) {
    return (
      <MetriqueGouvernanceCard
        ariaId="gouvernances-territoriales"
        dateGeneration={dateGeneration}
        downloadFilename="gouvernances-territoriales.png"
        downloadTitle="Gouvernances territoriales"
        error={gouvernancesTerritoriales.message}
      />
    )
  }

  const items = [
    ...gouvernancesTerritoriales.ventilationParTypeDeCoporteur.map((item) => ({
      backgroundColor: item.backgroundColor,
      color: item.color,
      count: item.count,
      label: item.type,
    })),
    ...(gouvernancesTerritoriales.sansCoporteur.count > 0
      ? [
          {
            backgroundColor: gouvernancesTerritoriales.sansCoporteur.backgroundColor,
            color: gouvernancesTerritoriales.sansCoporteur.color,
            count: gouvernancesTerritoriales.sansCoporteur.count,
            label: gouvernancesTerritoriales.sansCoporteur.label,
          },
        ]
      : []),
  ]

  const nombreCoPortees = gouvernancesTerritoriales.nombreTotal - gouvernancesTerritoriales.sansCoporteur.count

  return (
    <MetriqueGouvernanceCard
      ariaId="gouvernances-territoriales"
      dateGeneration={dateGeneration}
      downloadFilename="gouvernances-territoriales.png"
      downloadTitle="Gouvernances territoriales"
      items={items}
      nombreTotal={gouvernancesTerritoriales.nombreTotal}
      subtitle={
        <>
          dont <strong>{nombreCoPortees} co-portées</strong>
        </>
      }
      title="Gouvernances territoriales"
    />
  )
}

function isErrorViewModel(viewModel: ErrorViewModel | GouvernancesTerritorialesViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  dateGeneration: Date
  gouvernancesTerritoriales: ErrorViewModel | GouvernancesTerritorialesViewModel
}>
