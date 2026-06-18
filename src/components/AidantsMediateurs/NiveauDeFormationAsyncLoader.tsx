'use client'

import { ReactElement, use } from 'react'

import NiveauDeFormation from './NiveauDeFormation'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { NiveauDeFormationViewModel } from '@/presenters/tableauDeBord/niveauDeFormationPresenter'

export default function NiveauDeFormationAsyncLoader({
  dateGeneration,
  niveauDeFormationPromise,
}: Props): ReactElement {
  const niveauDeFormation = use(niveauDeFormationPromise)

  return <NiveauDeFormation dateGeneration={dateGeneration} niveauDeFormation={niveauDeFormation} />
}

type Props = Readonly<{
  dateGeneration: Date
  niveauDeFormationPromise: Promise<ErrorViewModel | NiveauDeFormationViewModel>
}>
