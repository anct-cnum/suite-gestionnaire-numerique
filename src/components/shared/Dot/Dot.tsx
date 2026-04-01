import classNames from 'classnames'
import { ReactElement } from 'react'

import styles from './Dot.module.css'

export default function Dot({ className, color }: Props): ReactElement {
  return <span aria-hidden="true" className={classNames(styles.dot, styles[color], className)} />
}

type Props = Readonly<{
  className?: string
  color: string
}>
