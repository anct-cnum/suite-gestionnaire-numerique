import { ReactElement, useContext, useId } from 'react'

import { clientContext } from '../shared/ClientContext'
import Modal from '../shared/Modal/Modal'
import ModalTitle from '../shared/ModalTitle/ModalTitle'

export default function SupprimerUnUtilisateur({
  id,
  isOpen,
  utilisateurASupprimer,
  closeModal,
}: Props): ReactElement {
  const { pathname, supprimerUnUtilisateurAction } = useContext(clientContext)
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
            onClick={async () => supprimer(utilisateurASupprimer.uid)}
            type="button"
          >
            Confirmer
          </button>
        </div>
      </div>
    </Modal>
  )

  async function supprimer(uidUtilisateurASupprimer: string): Promise<void> {
    await supprimerUnUtilisateurAction({ path: pathname, uidUtilisateurASupprimer })
    closeModal()
  }
}

type Props = Readonly<{
  id: string
  isOpen: boolean
  utilisateurASupprimer: UtilisateurASupprimer
  closeModal(): void
}>

type UtilisateurASupprimer = Readonly<{
  prenomEtNom: string
  uid: string
}>
