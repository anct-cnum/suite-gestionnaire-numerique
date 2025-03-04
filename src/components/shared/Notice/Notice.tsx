// istanbul ignore next @preserve
// Stryker disable next-line
import { ReactElement } from 'react'

import styles from './Notice.module.css'
import Icon from '../Icon/Icon'

export default function Notice(): ReactElement {
  return (
    <div className={`fr-notice border-radius fr-my-4w ${styles.background}`}>
      <p className="center">
        <Icon
          classname="fr-text--lead"
          icon="flashlight-fill"
        />
        Cette page présente des données fictives.
      </p>
    </div>
  )
}
