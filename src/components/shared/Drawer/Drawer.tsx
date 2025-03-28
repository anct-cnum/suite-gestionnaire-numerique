import { PropsWithChildren, ReactElement, Ref } from 'react'

import styles from './Drawer.module.css'

export default function Drawer({
  boutonFermeture,
  children,
  closeDrawer,
  id,
  isFixedWidth,
  isOpen,
  labelId,
  ref,
}: Props): ReactElement {
  // istanbul ignore next @preserve
  const boxSize = isFixedWidth ? styles['modal-box--fixed-width'] : ''

  return (
    <dialog
      aria-labelledby={labelId}
      className={`fr-modal ${styles['fr-modal']}`}
      id={id}
      open={isOpen}
      ref={ref}
    >
      <div className={`fr-container ${styles['fr-container']}`}>
        <div className="fr-grid-row fr-grid-row--right">
          <div className={`fr-col-5 ${styles['modal-box']} ${boxSize}`}>
            <div className={`fr-modal__body ${styles['fr-modal__body']}`}>
              <button
                aria-controls={id}
                className={`fr-btn fr-btn--tertiary fr-icon-close-line ${styles.close}`}
                onClick={closeDrawer}
                title={boutonFermeture}
                type="button"
              />
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

type Props = PropsWithChildren<Readonly<{
  boutonFermeture: string
  closeDrawer(): void
  id: string
  isFixedWidth: boolean
  isOpen: boolean
  labelId: string
  ref?: Ref<HTMLDialogElement>
}>>
