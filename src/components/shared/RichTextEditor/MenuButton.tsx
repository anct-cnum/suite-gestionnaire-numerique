// Stryker disable all
import { MouseEventHandler, ReactElement } from 'react'

import styles from './RichTextEditor.module.css'

export function MenuButton({
  title,
  icon,
  onClick,
  isActive,
}: Props): ReactElement {
  // istanbul ignore next @preserve
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

type Props = Readonly<{
  title: string
  icon: string
  onClick: MouseEventHandler<HTMLButtonElement>
  isActive: boolean
}>
