import { ReactElement } from 'react'

import Badge from '../Badge/Badge'

export default function Role({ role }: Props): ReactElement {
  return (
    <Badge color="blue-ecume">
      {role}
    </Badge>
  )
}

type Props = Readonly<{
  role: string
}>
