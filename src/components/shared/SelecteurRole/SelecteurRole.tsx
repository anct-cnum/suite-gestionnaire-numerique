'use client'

import { ReactElement, useContext } from 'react'

import { bouchonProfilUtilisateur } from './bouchon-profil-utilisateur'
import { sessionUtilisateurPresenter, SessionUtilisateurViewModel } from './session-utilisateur-presenter'
import { ROLES, type TypologieRole } from '../../../core/domain/role'
import '@gouvfr/dsfr/dist/component/select/select.min.css'
import { sessionUtilisateurContext } from '@/components/shared/session-utilisateur-context'

export default function SelecteurRole(): ReactElement {
  const { setSession } = useContext(sessionUtilisateurContext)
  return (
    <div className="fr-select-group">
      <label
        className="fr-label"
        htmlFor="mire-select"
      >
        Rôle utilisateur
      </label>
      <select
        className="fr-select"
        defaultValue=""
        id="mire-select"
        name="select-error"
        onChange={
          ({ currentTarget }) => {
            setSession(role(currentTarget.value as TypologieRole))
          }
        }
      >
        <option
          disabled={true}
          hidden={true}
          value=""
        >
          Sélectionner un rôle
        </option>
        {
          ROLES.map((role) =>
            (
              <option
                key={role}
                value={role}
              >
                {role}
              </option>))
        }
      </select>
    </div >
  )
}

function role(typologieRole: TypologieRole): SessionUtilisateurViewModel {
  return sessionUtilisateurPresenter(bouchonProfilUtilisateur[typologieRole],
    'Tartempion',
    'Martin')
}
