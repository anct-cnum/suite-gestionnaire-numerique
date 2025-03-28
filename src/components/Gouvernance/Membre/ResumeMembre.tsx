import Link from 'next/link'
import { ReactElement } from 'react'

import styles from '../Gouvernance.module.css'
import Resume from '../Resume'

export default function ResumeMembre({ denomination, membresLink, peutVoirNotePrivee, total }: Props): ReactElement {
  return (
    <Resume
      peutVoirNotePrivee={peutVoirNotePrivee}
      style={styles['resume-membres']}
    >
      <p>
        <span className="fr-display--sm">
          {total}
        </span>
        {' '}
        <span className="fr-text--lead">
          {denomination}
          {' '}
          <br />
          de la gouvernance
        </span>
      </p>
      <Link
        className={`fr-link fr-icon-arrow-right-line fr-link--icon-right ${styles['resume-a']}`}
        href={membresLink}
      >
        Voir les membres
      </Link>
    </Resume>
  )
}

type Props = Readonly<{
  denomination: string
  membresLink: string
  peutVoirNotePrivee: boolean
  total: number
}>
