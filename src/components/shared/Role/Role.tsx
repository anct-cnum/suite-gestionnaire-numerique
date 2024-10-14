import { ReactElement } from 'react'

import Badge from '../../shared/Badge/Badge'

export default function Role({ role }: RoleProps): ReactElement {
  return (
    <Badge color="blue-ecume">
      {role}
    </Badge>
  )
}

type RoleProps = Readonly<{
  role: string
}>
