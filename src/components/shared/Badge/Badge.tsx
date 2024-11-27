import { PropsWithChildren, ReactElement } from 'react'

import styles from './Badge.module.css'

export default function Badge({ children, color }: BadgeProps): ReactElement {
  return (
    <p className={`fr-badge fr-badge--${color} ${styles.badge}`}>
      {children}
    </p>
  )
}

type BadgeProps = PropsWithChildren<Readonly<{
  color: string
}>>
