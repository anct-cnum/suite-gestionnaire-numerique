import { ReactElement } from 'react'

import styles from './TitleIcon.module.css'

export default function TitleIcon({ background = 'blue', icon }: Props): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={`fr-icon-${icon} ${styles[background]} ${styles.icon}`}
    />
  )
}

type Props = Readonly<{
  background?: 'blue' | 'green' | 'pink' | 'purple' | 'red' | 'white'
  icon: string
}>
