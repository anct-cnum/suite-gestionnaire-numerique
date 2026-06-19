'use client'

import { ReactElement, useContext } from 'react'

import { clientContext } from '@/components/shared/ClientContext'
import Select from '@/components/shared/Select/Select'

export default function SelecteurRole({ ariaControlsId, startRoleTransition }: Props): ReactElement {
  const { changerMonRoleAction, pathname, roles, sessionUtilisateurViewModel } = useContext(clientContext)

  return (
    <Select
      ariaControlsId={ariaControlsId}
      id="role"
      name="role"
      onChange={(event) => {
        const nouveauRole = event.currentTarget.value
        startRoleTransition(async () => {
          await changerMonRoleAction({ nouveauRole, path: pathname })
        })
      }}
      options={roles
        .filter((role) => role !== 'Gestionnaire groupement' && role !== 'Gestionnaire région')
        .map((role) => ({
          id: role,
          isSelected: role === sessionUtilisateurViewModel.role.nom,
          label: role,
          value: role,
        }))}
    >
      Rôle
    </Select>
  )
}

type Props = Readonly<{
  ariaControlsId: string
  startRoleTransition(callback: () => Promise<void>): void
}>
