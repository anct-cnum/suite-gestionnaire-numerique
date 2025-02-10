import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import MesMembres from '@/components/MesMembres/MesMembres'
import { PrismaMesMembresLoader } from '@/gateways/PrismaMesMembresLoader'
import { mesMembresPresenter } from '@/presenters/mesMembresPresenter'
import { RecupererMesMembres } from '@/use-cases/queries/RecupererMesMembres'

export const metadata: Metadata = {
  title: 'Membres',
}

export default async function MembresController({ params }: Props): Promise<ReactElement> {
  const codeDepartement = (await params).codeDepartement

  if (!codeDepartement) {
    notFound()
  }

  const mesMembresReadModel = await new RecupererMesMembres(new PrismaMesMembresLoader())
    .handle({ codeDepartement })
  const mesMembresViewModel = mesMembresPresenter(mesMembresReadModel)

  return (
    <MesMembres mesMembresViewModel={mesMembresViewModel} />
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>
