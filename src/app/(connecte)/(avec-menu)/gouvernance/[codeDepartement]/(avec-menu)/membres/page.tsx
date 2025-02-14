import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import GestionMembres from '@/components/GestionMembresGouvernance/GestionMembres'
import { PrismaMesMembresLoader } from '@/gateways/PrismaMesMembresLoader'
import { mesMembresPresenter } from '@/presenters/membresPresenter'
import { RecupererMesMembres } from '@/use-cases/queries/RecupererMesMembres'

export const metadata: Metadata = {
  title: 'Membres',
}

export default async function MembresController({ params }: Props): Promise<ReactElement> {
  const codeDepartement = (await params).codeDepartement

  if (!codeDepartement) {
    notFound()
  }

  const membresReadModel = await new RecupererMesMembres(new PrismaMesMembresLoader())
    .handle({ codeDepartement })

  return (
    <GestionMembres membresViewModel={mesMembresPresenter(membresReadModel)} />
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>
