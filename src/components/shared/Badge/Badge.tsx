import { PropsWithChildren, ReactElement } from 'react'

import styles from './Badge.module.css'

export default function Badge({ children, color }: Props): ReactElement {
  return (
    <p className={`fr-badge fr-badge--${color} ${styles.badge}`}>
      {children}
    </p>
  )
}

type Props = PropsWithChildren<Readonly<{
  color: string
}>>
