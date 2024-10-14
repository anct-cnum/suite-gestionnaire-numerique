'use client'

import { FormEvent, ReactElement, useContext } from 'react'

import { changerMonRoleAction } from '../../../../../app/api/actions/changerMonRoleAction'
import { clientContext } from '@/components/shared/ClientContext'
import { Roles, TypologieRole } from '@/domain/Role'

export default function SelecteurRole(): ReactElement {
  const { session } = useContext(clientContext)

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
        defaultValue={session.role.nom}
        id="role"
        onChange={changerDeRole}
      >
        {
          Roles.map((nom): ReactElement => (
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
    await changerMonRoleAction(currentTarget.value as TypologieRole)
      .then(() => {
        window.location.reload()
      })
  }
}
