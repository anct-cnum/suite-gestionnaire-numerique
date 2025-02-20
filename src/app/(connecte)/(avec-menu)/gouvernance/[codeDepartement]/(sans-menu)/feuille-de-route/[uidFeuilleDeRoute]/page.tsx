import { ReactElement } from 'react'

import FeuilleDeRoute from '@/components/FeuilleDeRoute/FeuilleDeRoute'
import { feuilleDeRoutePresenter } from '@/presenters/feuilleDeRoutePresenter'

export default async function FeuilleDeRouteController({ params }: Props): Promise<ReactElement> {
  return <FeuilleDeRoute feuilleDeRouteViewModel={feuilleDeRoutePresenter((await params).codeDepartement)} />
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>
