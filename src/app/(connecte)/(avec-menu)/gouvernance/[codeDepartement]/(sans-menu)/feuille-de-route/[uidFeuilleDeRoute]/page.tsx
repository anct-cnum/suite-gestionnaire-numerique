import { ReactElement } from 'react'

import FeuilleDeRoute from '@/components/FeuilleDeRoute/FeuilleDeRoute'
import { PrismaUneFeuilleDeRouteLoader } from '@/gateways/PrismaUneFeuilleDeRouteLoader'
import { feuilleDeRoutePresenter } from '@/presenters/feuilleDeRoutePresenter'

export default async function FeuilleDeRouteController({ params }: Props): Promise<ReactElement> {
  const { uidFeuilleDeRoute } = await params

  const readModel = await new PrismaUneFeuilleDeRouteLoader().get(uidFeuilleDeRoute)

  return (
    <FeuilleDeRoute viewModel={feuilleDeRoutePresenter(readModel)} />
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    uidFeuilleDeRoute: string
  }>>
}>
