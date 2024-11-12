import { Dispatch, ReactElement, RefObject, SetStateAction, useContext } from 'react'

import { clientContext } from '../shared/ClientContext'
import { Notification } from '../shared/Notification/Notification'

export default function ReinviterUnUtilisateur({
  utilisateur,
  labelId,
  drawerId,
  setIsOpen,
  dialogRef,
}: DetailsUtilisateurProps): ReactElement {
  const { pathname, reinviterUnUtilisateurAction } = useContext(clientContext)

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
      <div className="fr-btns-group">
        <button
          aria-controls={drawerId}
          className="fr-btn fr-btn--secondary"
          data-fr-opened="false"
          onClick={Reinviter}
          type="button"
        >
          Renvoyer cette invitation
        </button>
      </div>
    </div>
  )

  async function Reinviter(): Promise<void> {
    await reinviterUnUtilisateurAction({
      path: pathname,
      uidUtilisateurAReinviter: utilisateur.uid,
    })
    close()
    Notification('success', { description: utilisateur.email, title: 'Invitation envoyée à ' })
  }

  function close(): void {
    setIsOpen(false)
    window.dsfr(dialogRef.current).modal.conceal()
  }
}

type DetailsUtilisateurProps = Readonly<{
  dialogRef: RefObject<HTMLDialogElement>
  utilisateur: Readonly<{
    email: string
    inviteLe: string
    uid: string
  }>
  labelId: string
  setIsOpen: Dispatch<SetStateAction<boolean>>
  drawerId: string
}>
