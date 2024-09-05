'use client'

import { FormEvent, ReactElement, useContext } from 'react'

import { changerMonRoleAction } from './changerMonRoleAction'
import { sessionUtilisateurContext } from '@/components/shared/SessionUtilisateurContext'
import { Roles, TypologieRole } from '@/domain/Role'

export default function SelecteurRole(): ReactElement {
  const { session } = useContext(sessionUtilisateurContext)

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
    await changerMonRoleAction(session, currentTarget.value as TypologieRole)
      .then((result) => {
        if (result === 'OK') {
          window.location.reload()
        }
      })
  }
}
