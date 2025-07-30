'use client'

import { ReactElement, useEffect, useState } from 'react'

import { filtrerDetails } from '@/components/Gouvernances/GouvernanceFiltrage'
import { FilterType } from '@/components/Gouvernances/GouvernancesList'
import { GouvernanceDetails } from '@/presenters/gouvernancesPresenter'

export default function GouvernanceListFiltre({
  details,
  drawerId,
  filterAvance,
  filtreGeographique,
  onFilterAction,
  onResetAction,
}: Props): ReactElement {
  const [avance, setAvance] = useState<FilterType>(filterAvance)
  const [geographique, setGeographique] = useState<string>(filtreGeographique)
  const [totalResults, setTotalResults] = useState(details.length)
  const [regions, setRegions] = useState<Array<string>>([])

  useEffect(() => {
    const detailsRegions = details.map(detail => detail.departementRegion)
    setRegions(Array.from(new Set(detailsRegions)))
  }, [])

  useEffect(() => {
    const nouveauDetails: Array<GouvernanceDetails> =
      filtrerDetails(details, geographique,avance)
    setTotalResults(nouveauDetails.length)
  }, [avance, geographique])

  return (
    <div className="sidepanel__content">
      <div className="fr-mb-3w">
        <label
          className="fr-label"
          htmlFor="region-select"
        >
          Par zone géographique
        </label>
        <select
          className="fr-select"
          id="region-select"
          onChange={(event) => {
            setGeographique(event.target.value)
          }}
          value={geographique}
        >
          <option value="">
            Toutes les régions
          </option>
          {regions.map((region) => (
            <option
              key={region}
              value={region}
            >
              {region}
            </option>
          ))}
        </select>
      </div>

      <fieldset
        aria-labelledby="radio-group-1"
        className="fr-fieldset fr-ml-0"
      >
        <div className="fr-radio-group fr-mb-2w">
          <input
            checked={avance === FilterType.NO_GOUV}
            id="gouv1"
            name="filters"
            onChange={() => {
              setAvance(FilterType.NO_GOUV)
            }}
            type="radio"
            value={FilterType.NO_GOUV}
          />
          <label
            className="fr-label"
            htmlFor="gouv1"
          >
            Départements sans gouvernance
          </label>
        </div>

        <div className="fr-radio-group fr-mb-2w">
          <input
            checked={avance === FilterType.NO_ROADMAP}
            id="gouv2"
            name="filters"
            onChange={() => {
              setAvance(FilterType.NO_ROADMAP)
            }}
            type="radio"
            value={FilterType.NO_ROADMAP}
          />
          <label
            className="fr-label"
            htmlFor="gouv2"
          >
            Départements sans Feuilles de route
          </label>
        </div>

        <div className="fr-radio-group fr-mb-2w">
          <input
            checked={avance === FilterType.MULTI_ROADMAP}
            id="gouv3"
            name="filters"
            onChange={() => {
              setAvance(FilterType.MULTI_ROADMAP)
            }}
            type="radio"
            value={FilterType.MULTI_ROADMAP}
          />
          <label
            className="fr-label"
            htmlFor="gouv3"
          >
            Départements avec plus d’une Feuille de route
          </label>
        </div>

        <div className="fr-radio-group fr-mb-2w">
          <input
            checked={avance === FilterType.NO_ACTIONS}
            id="gouv4"
            name="filters"
            onChange={() => {
              setAvance(FilterType.NO_ACTIONS)
            }}
            type="radio"
            value={FilterType.NO_ACTIONS}
          />
          <label
            className="fr-label"
            htmlFor="gouv4"
          >
            Départements sans actions
          </label>
        </div>
      </fieldset>

      <div className="fr-btns-group">
        <button
          aria-controls={drawerId}
          className="fr-btn"
          onClick={() => { onFilterAction(geographique, avance) }}
          type="button"
        >
          Afficher les
          {' '}
          {totalResults}
          {' '}
          résultats
        </button>
        <button
          aria-controls={drawerId}
          className="fr-btn fr-btn--secondary"
          onClick={onResetAction}
          type="button"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  )
}

type Props = Readonly<{
  details: Array<GouvernanceDetails>
  drawerId: string
  filterAvance: FilterType
  filtreGeographique: string
  onFilterAction: (filtreGeographique: string, filterAvance: FilterType) => void
  onResetAction: () => void
}>
