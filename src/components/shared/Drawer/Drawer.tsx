import { Dispatch, PropsWithChildren, ReactNode, SetStateAction } from 'react'

import styles from './Drawer.module.css'

export default function Drawer({
  id,
  isOpen,
  setIsOpen,
  boutonFermeture,
  isFixedWidth,
  children,
}: DrawerProps): ReactNode {
  return (
    <dialog
      aria-modal="true"
      className={`fr-modal ${styles['fr-modal']}`}
      id={id}
      open={isOpen}
    >
      <div className="fr-grid-row fr-grid-row--right">
        <div
className={`fr-col-4 ${styles['modal-box']} ${isFixedWidth ? styles['modal-box--fixed-width'] : ''}`}
        >
          <div className={`fr-modal__body ${styles['fr-modal__body']}`}>
            <button
              aria-controls={id}
              className={`fr-btn fr-btn--tertiary fr-icon-close-line ${styles.close}`}
              onClick={() => {
                setIsOpen(false)
              }}
              title={boutonFermeture}
              type="button"
            />
            <div className={`fr-modal__content ${styles['fr-modal__content']}`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  )
}


type DrawerProps = PropsWithChildren<Readonly<{
  id: string,
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  boutonFermeture: string
  isFixedWidth: boolean
}>>
