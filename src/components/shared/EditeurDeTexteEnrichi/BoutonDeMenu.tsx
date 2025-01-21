import { MouseEventHandler, ReactElement } from 'react'

import styles from './RichTextFormMenuBar.module.css'

type BoutonDeMenuProps = Readonly<{
  title: string
  icon: string
  onClick: MouseEventHandler<HTMLButtonElement>
  isActive: boolean
}>
// istanbul ignore next @preserve
export function BoutonDeMenu({
  title,
  icon,
  onClick,
  isActive,
}: BoutonDeMenuProps): ReactElement {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault()
    event.stopPropagation()
    onClick(event)
  }

  return (
    <button
      aria-label={title}
      aria-pressed={isActive}
      className={`${icon} ${styles.button} fr-icon--sm ${isActive ? styles.isActive : ''}`}
      data-testid={`${title}-button`}
      onClick={handleClick}
      title={title}
      type="button"
    />
  )
}
