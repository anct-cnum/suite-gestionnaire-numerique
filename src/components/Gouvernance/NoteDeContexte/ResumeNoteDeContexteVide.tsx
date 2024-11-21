import { ReactElement } from 'react'

import styles from '../Gouvernance.module.css'
import Resume from '../Resume'

export default function ResumeNoteDeContexteVide(): ReactElement {
  return (
    <Resume style={styles['resume-note-de-contexte']}>
      <p>
        Aucune note de contexte pour le moment.
      </p>
    </Resume>
  )
}
