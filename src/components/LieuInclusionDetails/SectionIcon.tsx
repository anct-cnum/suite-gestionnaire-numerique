import { ReactElement } from 'react'

import styles from './LieuInclusionDetailsShared.module.css'

export default function SectionIcon(props: Props): ReactElement {
  const { iconClass } = props

  return (
    <span
      aria-hidden="true"
      className={`${iconClass} fr-icon--xl fr-text-label--blue-france ${styles.iconWithBackground}`}
    />
  )
}

type Props = Readonly<{
  iconClass: string
}>