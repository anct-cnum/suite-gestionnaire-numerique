'use client'

import { ReactElement, useId } from 'react'

import { ContactFormData } from './FormulaireContactStructure'
import Modal from '../shared/Modal/Modal'
import ModalTitle from '../shared/ModalTitle/ModalTitle'

export default function SupprimerContactReferentStructure({
  closeModal,
  contactASupprimer,
  id,
  isOpen,
  onSupprimer,
}: Props): ReactElement {
  const labelModaleId = useId()

  return (
    <Modal close={closeModal} id={id} isOpen={isOpen} labelId={labelModaleId}>
      <div className="fr-modal__content">
        <ModalTitle id={labelModaleId}>
          Supprimer le contact {contactASupprimer?.prenom} {contactASupprimer?.nom} ?
        </ModalTitle>
        <p>En cliquant sur confirmer, ce contact sera définitivement supprimé de votre structure.</p>
      </div>
      <div className="fr-modal__footer">
        <div className="fr-btns-group fr-btns-group--right fr-btns-group--inline-lg fr-btns-group--icon-left">
          <button aria-controls={id} className="fr-btn fr-btn--secondary" onClick={closeModal} type="button">
            Annuler
          </button>
          <button
            aria-controls={id}
            className="fr-btn red-button"
            onClick={() => {
              void onSupprimer()
            }}
            type="button"
          >
            Confirmer
          </button>
        </div>
      </div>
    </Modal>
  )
}

type Props = Readonly<{
  closeModal(): void
  contactASupprimer: (ContactFormData & Readonly<{ id: number }>) | null
  id: string
  isOpen: boolean
  onSupprimer(): Promise<void> | void
}>
