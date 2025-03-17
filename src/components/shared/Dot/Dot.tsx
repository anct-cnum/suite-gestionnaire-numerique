import { ReactElement } from 'react'

import styles from './Dot.module.css'

export default function Dot({ color }: Props): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={`${styles.dot} ${styles[color]}`}
    />
  )
}

type Props = Readonly<{
  color: string
}>
