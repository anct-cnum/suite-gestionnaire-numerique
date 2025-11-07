import { ReactElement } from 'react'

import styles from './DonneesPersonnelles.module.css'
import PageTitle from '../shared/PageTitle/PageTitle'

export default function DonneesPersonnelles(): ReactElement {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <article
        aria-labelledby="donnees-personnelles-title"
        className={`fr-col-12 fr-col-lg-10 ${styles.article}`}
      >
        <PageTitle>
          Données personnelles
        </PageTitle>
      </article>
    </div>
  )
}
