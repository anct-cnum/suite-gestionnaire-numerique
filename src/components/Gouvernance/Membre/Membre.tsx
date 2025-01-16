import { ReactElement } from 'react'

import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import Icon from '@/components/shared/Icon/Icon'
import { MembreViewModel } from '@/presenters/gouvernancePresenter'

export default function DetailsMembre({ membreDetails, labelId }: Props): ReactElement {
  return (
    <DrawerTitle id={labelId}>
      <Icon icon={membreDetails.logo} />
      <br />
      {membreDetails.nom}
    </DrawerTitle>
  )
}

type Props = Readonly<{
  membreDetails: MembreViewModel
  labelId: string
}>
