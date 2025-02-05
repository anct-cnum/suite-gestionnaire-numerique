import { ReactElement, useContext, useState } from 'react'

import { clientContext } from '../shared/ClientContext'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import { Notification } from '../shared/Notification/Notification'

export default function ReinviterUnUtilisateur({
  utilisateur,
  labelId,
  drawerId,
  closeDrawer,
}: Props): ReactElement {
  const { pathname, reinviterUnUtilisateurAction } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)

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
          disabled={isDisabled}
          onClick={Reinviter}
          type="button"
        >
          {isDisabled ? 'Envois en cours...' : 'Renvoyer cette invitation'}
        </button>
      </div>
    </div>
  )

  async function Reinviter(): Promise<void> {
    setIsDisabled(true)
    const messages = await reinviterUnUtilisateurAction({
      path: pathname,
      uidUtilisateurAReinviter: utilisateur.uid,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: utilisateur.email, title: 'Invitation envoyée à ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    closeDrawer()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  utilisateur: Readonly<{
    email: string
    inviteLe: string
    uid: string
  }>
  labelId: string
  drawerId: string
  closeDrawer(): void
}>
