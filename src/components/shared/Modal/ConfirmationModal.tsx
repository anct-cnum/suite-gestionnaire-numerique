import { ReactElement, ReactNode } from 'react'

import Modal from './Modal'

export default function ConfirmationModal({
  cancelLabel = 'Annuler',
  children,
  confirmLabel,
  confirmVariant = 'primary',
  id,
  isOpen,
  onCancel,
  onConfirm,
  title,
}: Props): ReactElement {
  return (
    <Modal
      close={onCancel}
      concealingBackdrop={true}
      id={id}
      isOpen={isOpen}
      labelId={`${id}-title`}
    >
      <div className="fr-modal__content">
        <h2
          className="fr-modal__title"
          id={`${id}-title`}
        >
          {title}
        </h2>
        {children}
      </div>
      <div className="fr-modal__footer">
        <div className="fr-btns-group fr-btns-group--right fr-btns-group--inline-sm">
          <button
            className="fr-btn fr-btn--secondary"
            onClick={onCancel}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={confirmVariant === 'error' ? 'fr-btn red-button' : `fr-btn fr-btn--${confirmVariant}`}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

type Props = Readonly<{
  cancelLabel?: string
  children: ReactNode
  confirmLabel: string
  confirmVariant?: 'error' | 'primary' | 'secondary'
  id: string
  isOpen: boolean
  onCancel(): void
  onConfirm(): void
  title: string
}>
