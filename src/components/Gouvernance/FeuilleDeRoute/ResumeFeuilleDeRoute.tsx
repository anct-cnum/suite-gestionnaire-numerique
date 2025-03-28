import Link from 'next/link'
import { ReactElement } from 'react'

import styles from '../Gouvernance.module.css'
import Resume from '../Resume'

export default function ResumeFeuilleDeRoute({
  link,
  linkLabel,
  peutVoirNotePrivee,
  total,
  wording,
}: Props): ReactElement {
  return (
    <Resume
      peutVoirNotePrivee={peutVoirNotePrivee}
      style={styles['resume-feuilles-de-route']}
    >
      <p>
        <span className="fr-display--sm">
          {total}
        </span>
        {' '}
        <span className="fr-text--lead">
          {wording}
          {' '}
          <br />
          territoriale
        </span>
      </p>
      <Link
        className={`fr-link fr-icon-arrow-right-line fr-link--icon-right ${styles['resume-a']}`}
        href={link}
      >
        {linkLabel}
      </Link>
    </Resume>
  )
}

type Props = Readonly<{
  link: string
  linkLabel: string
  peutVoirNotePrivee: boolean
  total: string
  wording: string
}>
