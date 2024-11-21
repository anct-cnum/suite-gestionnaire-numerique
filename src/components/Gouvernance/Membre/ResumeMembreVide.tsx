import { ReactElement } from 'react'

import styles from '../Gouvernance.module.css'
import Resume from '../Resume'

export default function ResumeMembreVide(): ReactElement {
  return (
    <Resume style={styles['resume-membres']}>
      <p>
        <span className="fr-display--sm">
          0
        </span>
        {' '}
        <span className="fr-text--lead">
          membre
          {' '}
          <br />
          de la gouvernance
        </span>
      </p>
    </Resume>
  )
}
