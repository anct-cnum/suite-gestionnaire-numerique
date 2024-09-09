import { ReactElement } from 'react'

import Badge from '../../shared/Badge/Badge'
import { TypologieRole } from '@/domain/Role'

export default function Role({ role }: RoleProps): ReactElement {
  return (
    <Badge color="blue-ecume">
      {role}
    </Badge>
  )
}

type RoleProps = Readonly<{
  role: TypologieRole
}>
