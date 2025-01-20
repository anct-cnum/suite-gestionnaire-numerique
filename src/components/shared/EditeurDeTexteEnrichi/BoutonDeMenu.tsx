import { MouseEventHandler, ReactElement } from 'react'

import styles from './RichTextFormMenuBar.module.css'

type BoutonDeMenuProps = Readonly<{
  title: string
  icon: string
  onClick: MouseEventHandler<HTMLButtonElement>
  isActive: boolean
}>

export function BoutonDeMenu({
  title,
  icon,
  onClick,
  isActive,
}: BoutonDeMenuProps): ReactElement {
  return (
    <button
      aria-label={title}
      aria-pressed={isActive}
      className={`${icon} ${styles.button} fr-icon--sm ${isActive ? styles.isActive : ''}`}
      data-testid={`${title}-button`}
      onClick={(event) => {
        event.preventDefault()
        onClick(event)
      }}
      title={title}
      type="button"
    />
  )
}
