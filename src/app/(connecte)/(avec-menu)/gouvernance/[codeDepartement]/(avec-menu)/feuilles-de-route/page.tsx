import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import FeuillesDeRoute from '@/components/FeuillesDeRoute/FeuillesDeRoute'
import { PrismaLesFeuillesDeRouteLoader } from '@/gateways/PrismaLesFeuillesDeRouteLoader'
import { feuillesDeRoutePresenter } from '@/presenters/feuillesDeRoutePresenter'
import { etablirSyntheseFinanciereGouvernance } from '@/use-cases/services/EtablirSyntheseFinanciereGouvernance'

export const metadata: Metadata = {
  title: 'Feuilles de route',
}

export default async function FeuillesDeRouteController({ params }: Props): Promise<ReactElement> {
  try {
    const codeDepartement = (await params).codeDepartement
    const feuillesDeRouteReadModel = await new PrismaLesFeuillesDeRouteLoader(etablirSyntheseFinanciereGouvernance)
      .get(codeDepartement)
    const feuillesDeRouteViewModel = feuillesDeRoutePresenter(feuillesDeRouteReadModel)
    return  <FeuillesDeRoute feuillesDeRouteViewModel={feuillesDeRouteViewModel} />
  } catch {
    notFound()
  }
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>
