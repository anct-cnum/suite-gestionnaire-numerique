import { ReactElement } from 'react'

import styles from '../Gouvernance.module.css'
import Resume from '../Resume'

export default function ResumeFeuilleDeRouteVide(): ReactElement {
  return (
    <Resume style={styles['resume-feuilles-de-route']}>
      <p>
        <span className="fr-display--sm">
          0
        </span>
        {' '}
        <span className="fr-text--lead">
          feuille de route
          {' '}
          <br />
          territoriale
        </span>
      </p>
    </Resume>
  )
}
