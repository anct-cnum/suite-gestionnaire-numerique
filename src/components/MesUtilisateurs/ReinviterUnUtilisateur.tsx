import { Dispatch, ReactElement, RefObject, SetStateAction, useContext } from 'react'

import { clientContext } from '../shared/ClientContext'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import { Notification } from '../shared/Notification/Notification'

export default function ReinviterUnUtilisateur({
  utilisateur,
  labelId,
  drawerId,
  setIsOpen,
  dialogRef,
}: Props): ReactElement {
  const { pathname, reinviterUnUtilisateurAction } = useContext(clientContext)

  return (
    <div>
      <DrawerTitle id={labelId}>
        {utilisateur.inviteLe}
      </DrawerTitle>
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

type Props = Readonly<{
  dialogRef: RefObject<HTMLDialogElement | null>
  utilisateur: Readonly<{
    email: string
    inviteLe: string
    uid: string
  }>
  labelId: string
  setIsOpen: Dispatch<SetStateAction<boolean>>
  drawerId: string
}>
