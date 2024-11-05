import { ReactElement } from 'react'

export default function ReinviterUnUtilisateur({ utilisateur, labelId }: DetailsUtilisateurProps): ReactElement {
  return (
    <div>
      <h1
        className="fr-h2 color-blue-france"
        id={labelId}
      >
        Invitation envoyée le
        {' '}
        {utilisateur.inviteLe}
      </h1>
      <div
        className="fr-mb-4w"
      >
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
            //aria-controls={ariaControls}
            className="fr-btn fr-btn--secondary"
            data-fr-opened="false"
            type="button"
          >
            Renvoyer cette invitation
          </button>
        </li>
        <li>
          <button
            //aria-controls={ariaControls}
            className="fr-btn red-button"
            data-fr-opened="false"
            type="button"
          >
            Supprimer l’accès à cet utilisateur
          </button>
        </li>
      </ul>
    </div>
  )
}

type DetailsUtilisateurProps = Readonly<{
    utilisateur:Readonly<{
      email: string,
      inviteLe: string,
    }>
    labelId: string,
}>
