import { Dispatch, ReactElement, SetStateAction, useContext, useId } from 'react'

import { clientContext } from '../shared/ClientContext'
import Modal from '../shared/Modal/Modal'
import { supprimerUnUtilisateurAction } from '@/app/api/actions/supprimerUnUtilisateurAction'

export default function SupprimerUnUtilisateur({
  id,
  isOpen,
  utilisateurASupprimer,
  setIsOpen,
}: SupprimerUnUtilisateurProps): ReactElement {
  const { pathname } = useContext(clientContext)
  const modaleTitreId = useId()

  return (
    <Modal
      close={close}
      id={id}
      isOpen={isOpen}
      labelId={modaleTitreId}
    >
      <div className="fr-modal__content">
        <h1
          className="fr-modal__title"
          id={modaleTitreId}
        >
          Retirer
          {' '}
          {utilisateurASupprimer.prenomEtNom}
          {' '}
          de mon équipe d’utilisateurs ?
        </h1>
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
            onClick={close}
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

  function close(): void {
    setIsOpen(false)
  }

  async function supprimer(utilisateurASupprimerUid: string): Promise<void> {
    await supprimerUnUtilisateurAction({ path: pathname, utilisateurASupprimerUid })
    close()
  }
}

type SupprimerUnUtilisateurProps = Readonly<{
  id: string
  isOpen: boolean
  utilisateurASupprimer: UtilisateurASupprimer
  setIsOpen: Dispatch<SetStateAction<boolean>>
  setUtilisateurASupprimer: Dispatch<SetStateAction<UtilisateurASupprimer>>
}>

type UtilisateurASupprimer = Readonly<{
  prenomEtNom: string
  uid: string
}>
