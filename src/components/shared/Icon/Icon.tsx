import { ReactElement } from 'react'

import styles from './Icon.module.css'

export default function Icon({ icon }: Props): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={`fr-icon-${icon} icon-title fr-mr-3w color-blue-france ${styles['fr-icon']}`}
    />
  )
}

type Props = Readonly<{
  icon: string
}>
