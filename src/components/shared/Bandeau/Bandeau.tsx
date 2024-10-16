'use client'

import { ReactElement, useContext } from 'react'

import { clientContext } from '../ClientContext'

export interface BandeauInformations {
  titre: string
  description: string
}

export default function Bandeau(): ReactElement | null {
  const { bandeauInformations } = useContext(clientContext)

  const isDisplayed = () => {
    return bandeauInformations?.titre !== undefined /*&& bandeauInformations.description !== undefined*/
  }

  return isDisplayed() ? (
    <div className="fr-notice fr-notice--info fr-mb-5w">
      <div className="fr-container">
        <div className="fr-notice__body">
          <p>
            <span className="fr-notice__title">
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
