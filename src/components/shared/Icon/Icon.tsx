import { ReactElement } from 'react'

import styles from './Icon.module.css'

export default function Icon({ background = 'blue', icon }: Props): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={`fr-icon-${icon} ${styles[background]} ${styles.icon} fr-mr-3w`}
    />
  )
}

type Props = Readonly<{
  background?: 'blue' | 'white' | 'green' | 'pink' | 'purple' | 'red'
  icon: string
}>
