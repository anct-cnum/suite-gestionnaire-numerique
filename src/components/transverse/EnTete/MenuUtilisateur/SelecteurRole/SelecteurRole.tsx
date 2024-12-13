'use client'

import { FormEvent, ReactElement, useContext } from 'react'

import { clientContext } from '@/components/shared/ClientContext'

export default function SelecteurRole({ ariaControlsId }: Props): ReactElement {
  const { changerMonRoleAction, pathname, roles, sessionUtilisateurViewModel } = useContext(clientContext)

  return (
    <div className="fr-select-group">
      <label
        className="fr-label"
        htmlFor="role"
      >
        Rôle
      </label>
      <select
        className="fr-select"
        defaultValue={sessionUtilisateurViewModel.role.nom}
        id="role"
        onChange={changerDeRole}
      >
        {
          roles.map((nom): ReactElement => (
            <option
              aria-controls={ariaControlsId}
              key={nom}
              value={nom}
            >
              {nom}
            </option>
          ))
        }
      </select>
    </div>
  )

  async function changerDeRole({ currentTarget }: FormEvent<HTMLSelectElement>): Promise<void> {
    await changerMonRoleAction({ nouveauRole: currentTarget.value, path: pathname })
  }
}

type Props = Readonly<{
  ariaControlsId: string
}>
