import { ReactElement } from 'react'

import Badge from '../Badge/Badge'

export default function Statut({ color, libelle }: StatutProps): ReactElement {
  return (
    <Badge color={color}>
      {libelle}
    </Badge>
  )
}

type StatutProps = Readonly<{
  color: string
  libelle: string
}>
