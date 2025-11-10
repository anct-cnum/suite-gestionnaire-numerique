import { ReactElement } from 'react'

import styles from './TitleIcon.module.css'

export default function TitleIcon({ background = 'blue', icon }: Props): ReactElement {
  return (
    <div className={`${styles[background]} ${styles.container} fr-mr-2w`}>
      <span
        aria-hidden="true"
        className={`fr-icon-${icon} ${styles.icon}`}
      />
    </div>
  )
}

type Props = Readonly<{
  background?: 'blue' | 'green' | 'pink' | 'purple' | 'red' | 'white'
  icon: string
}>
