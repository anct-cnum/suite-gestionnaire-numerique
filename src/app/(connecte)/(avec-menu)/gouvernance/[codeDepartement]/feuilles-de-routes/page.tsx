import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import FeuillesDeRoute from '@/components/FeuillesDeRoute/FeuillesDeRoute'
import { PrismaLesFeuillesDeRouteLoader } from '@/gateways/PrismaLesFeuillesDeRouteLoader'
import { feuillesDeRoutePresenter } from '@/presenters/feuillesDeRoutePresenter'
import { RecupererLesFeuillesDeRoute } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

export default async function FeuillesDeRouteController({ params }: Props): Promise<ReactElement> {
  try {
    const codeDepartement = (await params).codeDepartement
    const feuillesDeRouteReadModel = await
    new RecupererLesFeuillesDeRoute(
      new PrismaLesFeuillesDeRouteLoader()
    ).handle({ codeDepartement })
    const feuillesDeRouteViewModel = feuillesDeRoutePresenter(feuillesDeRouteReadModel)
    return (
      <FeuillesDeRoute feuillesDeRouteViewModel={feuillesDeRouteViewModel} />
    )
  } catch {
    notFound()
  }
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>
