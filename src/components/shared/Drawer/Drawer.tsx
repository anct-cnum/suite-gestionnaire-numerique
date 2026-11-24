import { PropsWithChildren, ReactElement, ReactNode, Ref } from 'react'

import styles from './Drawer.module.css'

export default function Drawer({
  boutonFermeture,
  children,
  closeDrawer,
  contenuFocalisableSiDefilant = false,
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
            <div
              aria-labelledby={contenuFocalisableSiDefilant ? labelId : undefined}
              // Marges : le contour de focus du contenu défilant n'est pas rogné par le cadre de la fenêtre (10.7)
              className={`${popover === undefined ? 'fr-modal__content' : ''} ${styles['fr-modal__content']} ${contenuFocalisableSiDefilant ? 'fr-mx-1v fr-mb-1v' : ''}`}
              ref={contenuFocalisableSiDefilant ? rendreFocalisableSiDefilant : undefined}
              role={contenuFocalisableSiDefilant ? 'region' : undefined}
            >
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

// Firefox rend focalisable un contenu qui défile ; le piège à focus du DSFR, qui ne le connaît pas, renvoie alors
// sur le bouton de fermeture et les éléments suivants (ex. « Lire moins ») ne sont plus atteignables au clavier
// (RGAA 7.3). Le contenu entre explicitement dans l'ordre de tabulation, et seulement quand il défile ; zone nommée
// par le titre du volet, pour être annoncée sans relire tout son contenu.
function rendreFocalisableSiDefilant(contenu: HTMLDivElement | null): (() => void) | undefined {
  if (contenu === null) {
    return undefined
  }
  function ajuster(): void {
    if (contenu === null) {
      return
    }
    if (contenu.scrollHeight > contenu.clientHeight) {
      contenu.setAttribute('tabindex', '0')
    } else {
      contenu.removeAttribute('tabindex')
    }
  }
  ajuster()
  const observateur = new ResizeObserver(ajuster)
  observateur.observe(contenu)
  // Le contenu change de hauteur sans que le cadre change de taille (texte déplié) : on observe aussi ses enfants
  for (const enfant of Array.from(contenu.children)) {
    observateur.observe(enfant)
  }
  return () => {
    observateur.disconnect()
  }
}

type Props = PropsWithChildren<
  Readonly<{
    boutonFermeture: string
    closeDrawer?(): void
    contenuFocalisableSiDefilant?: boolean
    footer?: ReactNode
    id: string
    isFixedWidth: boolean
    isOpen?: boolean
    labelId: string
    popover?: 'auto' | 'manual'
    ref?: Ref<HTMLDialogElement>
  }>
>
