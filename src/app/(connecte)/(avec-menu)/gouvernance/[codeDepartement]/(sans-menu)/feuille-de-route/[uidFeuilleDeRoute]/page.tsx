import { ReactElement } from 'react'

import FeuilleDeRoute from '@/components/FeuilleDeRoute/FeuilleDeRoute'
import { PrismaUneFeuilleDeRouteLoader } from '@/gateways/PrismaUneFeuilleDeRouteLoader'
import { feuilleDeRoutePresenter } from '@/presenters/feuilleDeRoutePresenter'
import { etablirSyntheseFinanciereGouvernance } from '@/use-cases/services/EtablirSyntheseFinanciereGouvernance'

export default async function FeuilleDeRouteController({ params }: Props): Promise<ReactElement> {
  const { uidFeuilleDeRoute } = await params

  const readModel = await new PrismaUneFeuilleDeRouteLoader(etablirSyntheseFinanciereGouvernance).get(uidFeuilleDeRoute)

  return (
    <FeuilleDeRoute viewModel={feuilleDeRoutePresenter(readModel)} />
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    uidFeuilleDeRoute: string
  }>>
}>
