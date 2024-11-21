import { ReactElement } from 'react'

import styles from '../Gouvernance.module.css'
import Resume from '../Resume'

export default function ResumeNoteDeContexte({ sousTitre, texte }: ResumeNoteDeContexteProps): ReactElement {
  return (
    <Resume style={styles['resume-note-de-contexte']}>
      <p>
        {texte}
      </p>
      <hr className={styles['resume-hr']} />
      <p className="fr-text--xs">
        {sousTitre}
      </p>
    </Resume>
  )
}

type ResumeNoteDeContexteProps = Readonly<{
  texte: string
  sousTitre: string
}>
