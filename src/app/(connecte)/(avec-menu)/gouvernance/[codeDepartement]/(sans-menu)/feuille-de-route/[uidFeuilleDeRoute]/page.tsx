import { ReactElement } from 'react'

import FeuilleDeRoute from '@/components/FeuilleDeRoute/FeuilleDeRoute'
import { feuilleDeRoutePresenter } from '@/presenters/feuilleDeRoutePresenter'

export default function FeuilleDeRouteController(): ReactElement {
  return <FeuilleDeRoute feuilleDeRouteViewModel={feuilleDeRoutePresenter()} />
}
