import { ReactElement } from 'react'

import Badge from '../Badge/Badge'

export default function Statut({ color, libelle }: Props): ReactElement {
  return (
    <Badge color={color}>
      {libelle}
    </Badge>
  )
}

type Props = Readonly<{
  color: string
  libelle: string
}>
