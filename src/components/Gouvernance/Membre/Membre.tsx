import { ReactElement } from 'react'

import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import { MembreViewModel } from '@/presenters/gouvernancePresenter'

export default function DetailsMembre({ membreDetails, labelId }: Props): ReactElement {
  return (
    <DrawerTitle id={labelId}>
      {membreDetails.nom}
    </DrawerTitle>
  )
}

type Props = Readonly<{
  membreDetails: MembreViewModel,
  labelId: string
}>
