import classNames from 'classnames'

import styles from './TitleIcon.module.css'
import type { ReactElement } from 'react'

export default function TitleIcon({ background = 'blue', className, icon, size = 'medium' }: Props): ReactElement {
  return (
    <div className={classNames(styles.container, styles[background], styles[size], 'fr-mr-2w', className)}>
      <span aria-hidden="true" className={classNames(styles.icon, `fr-icon-${icon}`)} />
    </div>
  )
}

type Props = Readonly<{
  background?: 'blue' | 'green' | 'pink' | 'purple' | 'red' | 'white'
  className?: string
  icon?: string
  size?: 'large' | 'medium-large' | 'medium' | 'small'
}>
