import { ReactElement } from 'react'

import { openingState } from './opening-hours.presenter'

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

export default function OpeningState(props: OpeningStateProps): null | ReactElement {
  const { osmOpeningHours } = props
  // eslint-disable-next-line no-restricted-syntax
  const today = new Date()
  const state = openingState(today)(osmOpeningHours)

  return state === undefined ?  null : (
    <div className="fr-grid-row fr-grid-row--gutters fr-mb-2w">
      {state.isOpen ? (
        <>
          <div className="fr-col-auto">
            <p className="fr-badge fr-badge--success fr-badge--sm fr-mb-0">
              Ouvert
            </p>
          </div>
          {state.time !== undefined && (
            <div className="fr-col-auto">
              <p className="fr-text--sm fr-text--bold fr-mb-0">
                Ferme à
                {' '}
                {state.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="fr-col-auto">
            <p className="fr-badge fr-badge--error fr-badge--sm fr-mb-0">
              Fermé
            </p>
          </div>
          {state.time !== undefined && (
            <div className="fr-col-auto">
              <p className="fr-text--sm fr-text--bold fr-mb-0">
                Ouvre
                {' '}
                {today.getDay() === state.day ? 'aujourd\'hui' : JOURS[state.day]}
                {' '}
                à
                {' '}
                {state.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

type OpeningStateProps = Readonly<{
  osmOpeningHours?: string
}>
