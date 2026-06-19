import { PropsWithChildren, ReactElement, ReactNode, Ref } from 'react'

import styles from './Drawer.module.css'

export default function Drawer({
  boutonFermeture,
  children,
  closeDrawer,
  footer,
  id,
  isFixedWidth,
  isOpen,
  labelId,
  popover,
  ref,
}: Props): ReactElement {
  // istanbul ignore next @preserve
  const boxSize = isFixedWidth ? styles['modal-box--fixed-width'] : ''

  const content = (
    <div className={`fr-container ${styles['fr-container']}`}>
      <div className="fr-grid-row fr-grid-row--right">
        <div className={`fr-col-5 ${styles['modal-box']} ${boxSize}`}>
          <div className={`${popover === undefined ? 'fr-modal__body' : ''} ${styles['fr-modal__body']}`}>
            <button
              aria-controls={popover === undefined ? id : undefined}
              className={`fr-btn fr-btn--tertiary fr-icon-close-line ${styles.close}`}
              onClick={closeDrawer}
              popoverTarget={popover !== undefined ? id : undefined}
              popoverTargetAction={popover !== undefined ? 'hide' : undefined}
              title={boutonFermeture}
              type="button"
            />
            <div className={`${popover === undefined ? 'fr-modal__content' : ''} ${styles['fr-modal__content']}`}>
              {children}
            </div>
            {footer !== undefined && <div className={styles['fr-modal__footer']}>{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  )

  if (popover !== undefined) {
    return (
      <div // eslint-disable-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- Escape géré nativement par le popover
        aria-labelledby={labelId}
        className={styles['fr-modal']}
        id={id}
        onClick={(event) => {
          if (!(event.target as HTMLElement).closest(`.${styles['modal-box']}`)) {
            event.currentTarget.hidePopover()
          }
        }}
        popover={popover}
        role="dialog"
      >
        {content}
      </div>
    )
  }

  return (
    <dialog aria-labelledby={labelId} className={`fr-modal ${styles['fr-modal']}`} id={id} open={isOpen} ref={ref}>
      {content}
    </dialog>
  )
}

type Props = PropsWithChildren<
  Readonly<{
    boutonFermeture: string
    closeDrawer?(): void
    footer?: ReactNode
    id: string
    isFixedWidth: boolean
    isOpen?: boolean
    labelId: string
    popover?: 'auto' | 'manual'
    ref?: Ref<HTMLDialogElement>
  }>
>
