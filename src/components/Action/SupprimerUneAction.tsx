import { ReactElement, useId, useState } from 'react'

import Icon from '@/components/shared/Icon/Icon'
import Modal from '@/components/shared/Modal/Modal'
import ModalTitle from '@/components/shared/ModalTitle/ModalTitle'
import { Notification } from '@/components/shared/Notification/Notification'

export default function SupprimerUneAction({
  actionASupprimer,
  id,
}: Props): ReactElement  {
  const [isDisabled, setIsDisabled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const labelModaleId = useId()
  const modalId = useId()
  return (
    <>
      <button
        className="fr-btn fr-btn--tertiary color-red"
        disabled={!actionASupprimer.estSupprimable}
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        title={`Supprimer ${actionASupprimer.nom}`}
        type="button"
      >
        <Icon icon="delete-line" />
      </button>

      <Modal
        close={() => { setIsOpen(false) }}
        id={`${id}-${modalId}`}
        isOpen={isOpen}
        labelId={labelModaleId}
      >
        <div className="fr-modal__content">
          <ModalTitle id={labelModaleId}>
            Vous allez supprimer l&#39;action
            {' '}
            {actionASupprimer.nom}
            {' '}
            de la feuille de route
          </ModalTitle>
          <p>
            En cliquant sur confirmer, l&#39;action sera définitivement supprimé de votre feuille de route
          </p>
        </div>
        <div className="fr-modal__footer">
          <div className="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg fr-btns-group--icon-left">
            <button
              aria-controls={id}
              className="fr-btn fr-btn--secondary"
              onClick={() => { setIsOpen(false) }}
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
  </>)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function supprimer(uidActionASupprimer: string): Promise<void> {
    setIsDisabled(true)
    const messages =  ['Ok']//await supprimerUnActionAction({ path: pathname, uidUtilisateurASupprimer })
    if (messages.includes('OK')) {
      Notification('success', { description: 'supprimé', title: 'Action ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    setIsOpen(false)
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  actionASupprimer: ActionASupprimer
  id: string
}>
type ActionASupprimer = Readonly<{
  estSupprimable: boolean
  nom: string
  uid: string
}>
