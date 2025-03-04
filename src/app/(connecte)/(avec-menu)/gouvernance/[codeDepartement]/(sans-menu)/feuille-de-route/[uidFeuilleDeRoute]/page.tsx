import { ReactElement } from 'react'

import FeuilleDeRoute from '@/components/FeuilleDeRoute/FeuilleDeRoute'
import Notice from '@/components/shared/Notice/Notice'
import { feuilleDeRoutePresenter } from '@/presenters/feuilleDeRoutePresenter'

export default async function FeuilleDeRouteController({ params }: Props): Promise<ReactElement> {
  const { codeDepartement, uidFeuilleDeRoute } = await params

  return (
    <>
      <Notice />
      <FeuilleDeRoute feuilleDeRouteViewModel={feuilleDeRoutePresenter(codeDepartement, uidFeuilleDeRoute)} />
    </>
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
    uidFeuilleDeRoute: string
  }>>
}>
