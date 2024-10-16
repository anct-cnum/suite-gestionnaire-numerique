'use client'

import { FormEvent, ReactElement, useContext } from 'react'

import { changerMonRoleAction } from '../../../../../app/api/actions/changerMonRoleAction'
import { clientContext } from '@/components/shared/ClientContext'

export default function SelecteurRole(): ReactElement {
  const { roles, sessionUtilisateurViewModel } = useContext(clientContext)

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
    await changerMonRoleAction(currentTarget.value)
      .then(() => {
        window.location.reload()
      })
  }
}
