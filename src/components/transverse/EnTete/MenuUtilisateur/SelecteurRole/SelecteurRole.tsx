'use client'

import { FormEvent, ReactElement, useContext } from 'react'

import { clientContext } from '@/components/shared/ClientContext'
import Select from '@/components/shared/Select/Select'

export default function SelecteurRole({ ariaControlsId }: Props): ReactElement {
  const { changerMonRoleAction, pathname, roles, sessionUtilisateurViewModel } = useContext(clientContext)

  return (
    <div className="fr-select-group">
      <Select
        ariaControlsId={ariaControlsId}
        id="role"
        name="role"
        onChange={changerDeRole}
        options={roles.map((role) => ({
          isSelected: role === sessionUtilisateurViewModel.role.nom,
          label: role,
          uid: role,
        }))}
      >
        Rôle
      </Select>
    </div>
  )

  async function changerDeRole({ currentTarget }: FormEvent<HTMLSelectElement>): Promise<void> {
    await changerMonRoleAction({ nouveauRole: currentTarget.value, path: pathname })
  }
}

type Props = Readonly<{
  ariaControlsId: string
}>
