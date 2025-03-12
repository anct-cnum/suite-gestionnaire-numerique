'use client'

import { FormEvent, ReactElement, useContext } from 'react'

import { clientContext } from '@/components/shared/ClientContext'
import Select from '@/components/shared/Select/Select'

export default function SelecteurRole({ ariaControlsId }: Props): ReactElement {
  const { changerMonRoleAction, pathname, roles, sessionUtilisateurViewModel } = useContext(clientContext)

  return (
    <Select
      ariaControlsId={ariaControlsId}
      id="role"
      name="role"
      onChange={changerDeRole}
      options={roles.map((role) => ({
        id: role,
        isSelected: role === sessionUtilisateurViewModel.role.nom,
        label: role,
        value: role,
      }))}
    >
      Rôle
    </Select>
  )

  async function changerDeRole({ currentTarget }: FormEvent<HTMLSelectElement>): Promise<void> {
    await changerMonRoleAction({ nouveauRole: currentTarget.value, path: pathname })
  }
}

type Props = Readonly<{
  ariaControlsId: string
}>
