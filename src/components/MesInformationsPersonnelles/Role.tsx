import { ReactElement } from 'react'

import { TypologieRole } from '@/domain/Role'

export default function Role({ role }: RoleProps): ReactElement {
  return (
    <p className="fr-badge fr-badge--blue-ecume">
      {role}
    </p>
  )
}

type RoleProps = Readonly<{
  role: TypologieRole
}>
