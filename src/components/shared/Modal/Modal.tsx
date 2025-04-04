import { PropsWithChildren, ReactElement } from 'react'

export default function Modal({
  children,
  close,
  id,
  isOpen,
  labelId,
}: Props): ReactElement {
  return (
    <dialog
      aria-labelledby={labelId}
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
              {children}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  )
}

type Props = PropsWithChildren<Readonly<{
  close(): void
  id: string
  isOpen: boolean
  labelId: string
}>>
