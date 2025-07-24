import { ReactElement } from 'react'

import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'

export default function GouvernancesHearder(): ReactElement {
  return (
    <section
      aria-labelledby="entete"
    >
      <div className="fr-grid-row fr-grid-row--middle fr-pb-2w">
        <div
          className="fr-col-auto"
          style={{ alignItems: 'stretch', display: 'flex' }}
        >
          <TitleIcon icon="france-line" />
        </div>
        <div className="fr-col fr-grid-row fr-grid-row--middle">
          <div>
            <div
              className="fr-mb-1w"
            >
              <h2
                className="fr-h2 fr-text-label--blue-france"
                id="etatDesLieux"
              >
                Gouvernances territoriales
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
