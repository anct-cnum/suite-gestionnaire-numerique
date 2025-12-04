import { PropsWithChildren, ReactElement, useEffect } from 'react'

export default function Modal({
  children,
  close,
  concealingBackdrop = true,
  id,
  isOpen,
  labelId,
}: Props): ReactElement {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('fr-modal-opened')
    } else {
      document.body.classList.remove('fr-modal-opened')
    }

    return (): void => {
      document.body.classList.remove('fr-modal-opened')
    }
  }, [isOpen])

  return (
    <dialog
      aria-labelledby={labelId}
      aria-modal="true"
      className={`fr-modal ${isOpen ? 'fr-modal--opened' : ''}`}
      data-fr-concealing-backdrop={concealingBackdrop}
      id={id}
      open={isOpen}
    >
      <div className="fr-container fr-container--fluid fr-container-md">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
            <div className="fr-modal__body">
              <div className="fr-modal__header">
                <button
                  aria-controls={id}
                  className="fr-btn--close fr-btn"
                  onClick={close}
                  title="Fermer"
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
  concealingBackdrop?: boolean
  id: string
  isOpen: boolean
  labelId: string
}>>
