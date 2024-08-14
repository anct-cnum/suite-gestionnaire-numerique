'use client'

import { FormEvent, ReactElement, useContext } from 'react'

import { sessionUtilisateurContext } from '@/components/shared/SessionUtilisateurContext'
import { Roles, TypologieRole } from '@/domain/Role'
import { updateSessionUtilisateurPresenter } from '@/presenters/sessionUtilisateurPresenter'

export default function SelecteurRole(): ReactElement {
  const { session, setSession } = useContext(sessionUtilisateurContext)

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
    </div >
  )

  function changerDeRole({ currentTarget }: FormEvent<HTMLSelectElement>) {
    setSession(updateSessionUtilisateurPresenter(session, currentTarget.value as TypologieRole))
  }
}
