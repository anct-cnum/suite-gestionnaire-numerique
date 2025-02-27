import { ReactElement } from 'react'

import FeuilleDeRoute from '@/components/FeuilleDeRoute/FeuilleDeRoute'
import { feuilleDeRoutePresenter } from '@/presenters/feuilleDeRoutePresenter'

export default async function FeuilleDeRouteController({ params }: Props): Promise<ReactElement> {
  const { codeDepartement, uidFeuilleDeRoute } = await params

  return <FeuilleDeRoute feuilleDeRouteViewModel={feuilleDeRoutePresenter(codeDepartement, uidFeuilleDeRoute)} />
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
    uidFeuilleDeRoute: string
  }>>
}>
