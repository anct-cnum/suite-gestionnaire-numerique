import { ReactElement, useContext, useId, useState } from 'react'

import { clientContext } from '../shared/ClientContext'
import Modal from '../shared/Modal/Modal'
import ModalTitle from '../shared/ModalTitle/ModalTitle'
import { Notification } from '../shared/Notification/Notification'

export default function SupprimerUneAction({
  actionASupprimer,
  closeModal,
  id,
  isOpen,
}: Props): ReactElement {
  const { pathname, supprimerUneActionAction } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  const labelModaleId = useId()

  return (
    <Modal
      close={closeModal}
      id={id}
      isOpen={isOpen}
      labelId={labelModaleId}
    >
      <div className="fr-modal__content">
        <ModalTitle id={labelModaleId}>
          Vous allez supprimer l’action
          {' '}
          {actionASupprimer.nom}
          {' '}
          de la feuille de route ?
        </ModalTitle>
        <p>
          En cliquant sur confirmer, l’action sera définitivement supprimé de votre feuille de route
        </p>
      </div>
      <div className="fr-modal__footer">
        <div className="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg fr-btns-group--icon-left">
          <button
            aria-controls={id}
            className="fr-btn fr-btn--secondary"
            onClick={closeModal}
            type="button"
          >
            Annuler
          </button>
          <button
            aria-controls={id}
            className="fr-btn red-button"
            disabled={isDisabled}
            onClick={async () => supprimer(actionASupprimer.uid)}
            type="button"
          >
            {isDisabled ? 'Suppression en cours...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </Modal>
  )

  async function supprimer(uidActionASupprimer: string): Promise<void> {
    setIsDisabled(true)
    const messages = await supprimerUneActionAction({ path: pathname, uidActionASupprimer })
    if (messages.includes('OK')) {
      Notification('success', { description: 'supprimé', title: 'action ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    closeModal()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  actionASupprimer: ActionASupprimer
  closeModal(): void
  id: string
  isOpen: boolean
}>
type ActionASupprimer = Readonly<{
  nom: string
  uid: string
}>
