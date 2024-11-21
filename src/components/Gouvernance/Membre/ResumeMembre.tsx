import Link from 'next/link'
import { ReactElement } from 'react'

import styles from '../Gouvernance.module.css'
import Resume from '../Resume'

export default function ResumeMembre({ total, type }: ResumeMembreProps): ReactElement {
  return (
    <Resume style={styles['resume-membres']}>
      <p>
        <span className="fr-display--sm">
          {total}
        </span>
        {' '}
        <span className="fr-text--lead">
          {type}
          {' '}
          <br />
          de la gouvernance
        </span>
      </p>
      <hr className={styles['resume-hr']} />
      <Link
        className={`fr-link fr-icon-arrow-right-line fr-link--icon-right ${styles['resume-a']}`}
        href="/"
      >
        Voir les membres
      </Link>
    </Resume>
  )
}

type ResumeMembreProps = Readonly<{
  total: string
  type: string
}>
