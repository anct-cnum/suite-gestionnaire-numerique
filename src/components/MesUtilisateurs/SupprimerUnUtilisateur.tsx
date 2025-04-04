import { ReactElement, useContext, useId, useState } from 'react'

import { clientContext } from '../shared/ClientContext'
import Modal from '../shared/Modal/Modal'
import ModalTitle from '../shared/ModalTitle/ModalTitle'
import { Notification } from '../shared/Notification/Notification'

export default function SupprimerUnUtilisateur({
  closeModal,
  id,
  isOpen,
  utilisateurASupprimer,
}: Props): ReactElement {
  const { pathname, supprimerUnUtilisateurAction } = useContext(clientContext)
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
          Retirer
          {' '}
          {utilisateurASupprimer.prenomEtNom}
          {' '}
          de mon équipe d’utilisateurs ?
        </ModalTitle>
        <p>
          En cliquant sur confirmer, cet utilisateur n’aura plus accès à votre espace de
          gestion.
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
            onClick={async () => supprimer(utilisateurASupprimer.uid)}
            type="button"
          >
            {isDisabled ? 'Suppression en cours...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </Modal>
  )

  async function supprimer(uidUtilisateurASupprimer: string): Promise<void> {
    setIsDisabled(true)
    const messages = await supprimerUnUtilisateurAction({ path: pathname, uidUtilisateurASupprimer })
    if (messages.includes('OK')) {
      Notification('success', { description: 'supprimé', title: 'Utilisateur ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    closeModal()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  closeModal(): void
  id: string
  isOpen: boolean
  utilisateurASupprimer: UtilisateurASupprimer
}>

type UtilisateurASupprimer = Readonly<{
  prenomEtNom: string
  uid: string
}>
