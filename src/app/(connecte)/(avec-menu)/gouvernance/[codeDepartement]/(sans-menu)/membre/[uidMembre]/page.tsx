import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import Membre from '@/components/Membre/Membre'
import { membrePresenter } from '@/presenters/membrePresenter'

export default async function MembreController({ params }: Props): Promise<ReactElement> {
  const { codeDepartement, uidMembre } = await params

  if (!uidMembre) {
    notFound()
  }

  const viewModel = membrePresenter(codeDepartement)

  return (
    <Membre viewModel={viewModel} />
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
    uidMembre: string
  }>>
}>
