import { ReactElement } from 'react'

import { FilterType } from '@/components/Gouvernances/GouvernancesList'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'

export default function GouvernancesHearder(props: Props): ReactElement {
  const { drawerId, filterAvance, filtreGeographique, onFilterClick } = props
  return (
    <section
      aria-labelledby="entete"
      className="fr-pb-2w"
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
            <div className="fr-mb-1w">
              <h2
                className="fr-h2 fr-text-label--blue-france"
                id="etatDesLieux"
              >
                Gouvernances territoriales
              </h2>
            </div>
          </div>

        </div>
        <button
          aria-controls={drawerId}
          className="fr-btn fr-btn--secondary fr-btn--icon-left fr-fi-filter-line badge-button"
          data-fr-opened="false"
          onClick={onFilterClick}
          type="button"
        >
          Filtrer
        </button>
      </div>
      <div>
        {filterAvance.value !== FilterType.NO_FILTRE ? (
          <button
            aria-label={`Retirer le filtre ${filterAvance.libeller}`}
            className="fr-tag fr-icon-close-line fr-tag--icon-left fr-mr-1w "
            onClick={() => {
              setTimeout(() => {
                filterAvance.onRemove()
              }, 0)
            }}
            type="button"
          >
            {filterAvance.libeller}
          </button>
        ) : null}

        {filtreGeographique.value !== '' ? (
          <button
            aria-label={`Retirer le filtre ${filtreGeographique.value}`}
            className="fr-tag fr-icon-close-line fr-tag--icon-left"
            onClick={() => {
              setTimeout(() => {
                filtreGeographique.onRemove()
              }, 0)
            }}
            type="button"
          >
            {filtreGeographique.value}
          </button>
        ) : null}

      </div>
    </section>
  )
}
type Props = Readonly<{
  drawerId: string
  filterAvance:{
    libeller:string
    onRemove: () => void
    value:FilterType
  }
  filtreGeographique: {
    onRemove: () => void
    value:string
  }
  onFilterClick: () => void
}>
