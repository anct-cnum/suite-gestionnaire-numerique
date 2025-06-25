import { ReactElement } from 'react'

import styles from './ErreurDonnees.module.css'

export default function ErreurDonnees({ message }: Props): ReactElement {
  return (
    <div className={`fr-alert fr-alert--warning fr-mb-4w ${styles.container}`}>
      <div className="fr-alert__body">
        <div className="fr-alert__content">
          <h3 className="fr-alert__title">
            ⚠️ Erreur de récupération de données
          </h3>
          <p className="fr-alert__message">
            {message || 'Une erreur est survenue lors de la récupération des données. Veuillez réessayer plus tard.'}
          </p>
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  message?: string
}> 