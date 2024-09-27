import { Dispatch, ReactElement, SetStateAction, useId } from 'react'

import { supprimerUnUtilisateurAction } from '@/app/api/actions/supprimerUnUtilisateurAction'

export default function SupprimerUnUtilisateur({
  id,
  isOpen,
  utilisateurASupprimer,
  setIsOpen,
}: SupprimerUnUtilisateurProps): ReactElement {
  const modaleTitreId = useId()

  return (
    <dialog
      aria-labelledby={modaleTitreId}
      aria-modal="true"
      className="fr-modal"
      id={id}
      open={isOpen}
    >
      <div className="fr-container fr-container--fluid fr-container-md">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
            <div className="fr-modal__body modal-body">
              <div className="fr-modal__header">
                <button
                  aria-controls={id}
                  className="fr-btn--close fr-btn"
                  onClick={close}
                  type="button"
                >
                  Fermer
                </button>
              </div>
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
            </div>
          </div>
        </div>
      </div>
    </dialog>
  )

  function close(): void {
    setIsOpen(false)
  }

  async function supprimer(utilisateurASupprimerId: string): Promise<void> {
    await supprimerUnUtilisateurAction(utilisateurASupprimerId)
    close()
    window.location.reload()

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
