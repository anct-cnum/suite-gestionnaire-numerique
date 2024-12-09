import { Dispatch, forwardRef, PropsWithChildren, ReactNode, Ref, SetStateAction } from 'react'

import styles from './Drawer.module.css'

export default forwardRef(Drawer)

function Drawer({
  id,
  isOpen,
  setIsOpen,
  boutonFermeture,
  isFixedWidth,
  labelId,
  children,
  icon,
}: DrawerProps,
ref: Ref<HTMLDialogElement>): ReactNode {
  // istanbul ignore next @preserve
  const boxSize = isFixedWidth ? styles['modal-box--fixed-width'] : ''

  return (
    <dialog
      aria-labelledby={labelId}
      aria-modal="true"
      className={`fr-modal ${styles['fr-modal']}`}
      id={id}
      open={isOpen}
      ref={ref}
    >
      <div className={`fr-container ${styles['fr-container']}`}>
        <div className="fr-grid-row fr-grid-row--right">
          <div className={`fr-col-5 ${styles['modal-box']} ${boxSize}`}>
            <div className={`fr-modal__body ${styles['fr-modal__body']}`}>
              <div className="fr-modal__header">
                {icon}
                <button
                  aria-controls={id}
                  className={`fr-btn fr-btn--tertiary fr-icon-close-line ${styles.close}`}
                  onClick={() => {
                    setIsOpen(false)
                  }}
                  title={boutonFermeture}
                  type="button"
                />
              </div>
              <div className={`fr-modal__content ${styles['fr-modal__content']}`}>
                {children}
              </div>
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
  labelId: string
  isFixedWidth: boolean
  icon?: ReactNode
}>>
