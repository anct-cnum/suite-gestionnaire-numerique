import { Dispatch, ReactElement, SetStateAction } from 'react'

import { reinviterUnUtilisateurAction } from '@/app/api/actions/reInviterUnUtilisateurAction'
import { supprimerUnUtilisateurAction } from '@/app/api/actions/supprimerUnUtilisateurAction'

export default function ReinviterUnUtilisateur({
  utilisateur,
  labelId,
  drawerId,
  setIsOpen,
}: DetailsUtilisateurProps): ReactElement {
  return (
    <div>
      <h1
        className="fr-h2 color-blue-france"
        id={labelId}
      >
        {utilisateur.inviteLe}
      </h1>
      <div className="fr-mb-4w">
        <div className="color-grey">
          Adresse électronique
        </div>
        <div className="font-weight-700">
          {utilisateur.email}
        </div>
      </div>
      <ul className="fr-btns-group">
        <li>
          <button
            aria-controls={drawerId}
            className="fr-btn fr-btn--secondary"
            data-fr-opened="false"
            onClick={async () => {
              await reinviterUnUtilisateurAction({ email: utilisateur.email })
              close()
            }}
            type="button"
          >
            Renvoyer cette invitation
          </button>
        </li>
        <li>
          <button
            aria-controls={drawerId}
            className="fr-btn red-button"
            data-fr-opened="false"
            onClick={async () => {
              await supprimerUnUtilisateurAction(utilisateur.uid)
              close()
            }}
            type="button"
          >
            Supprimer l’accès à cet utilisateur
          </button>
        </li>
      </ul>
    </div>
  )

  function close(): void {
    setIsOpen(false)
    window.location.reload()
  }
}

type DetailsUtilisateurProps = Readonly<{
  utilisateur: Readonly<{
    email: string
    inviteLe: string
    uid: string
  }>
  labelId: string
  setIsOpen: Dispatch<SetStateAction<boolean>>
  drawerId: string
}>
