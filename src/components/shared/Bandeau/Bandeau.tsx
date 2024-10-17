'use client'

import { ReactElement, useContext } from 'react'

import styles from './Bandeau.module.css'
import { clientContext } from '../ClientContext'

export interface BandeauInformations {
  titre: string | undefined
  description: string | undefined
}

export default function Bandeau(): ReactElement | null {
  const { bandeauInformations } = useContext(clientContext)

  const isDisplayed = (): boolean => {
    return bandeauInformations?.titre !== undefined && bandeauInformations.description !== undefined
  }

  return isDisplayed() ? (
    <div className={`fr-notice ${styles.success}`}>
      <div className="fr-container">
        <div className={`fr-notice__body ${styles.center}`}>
          <p>
            <span className="fr-notice__title fr-icon-success-fill">
              {bandeauInformations?.titre}
            </span>
            <span className="fr-notice__desc">
              {bandeauInformations?.description}
            </span>
          </p>
        </div>
      </div>
    </div>
  ) : null
}
