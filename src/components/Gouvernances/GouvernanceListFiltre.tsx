'use client'

import { ReactElement, useEffect, useState } from 'react'

import { filtrerDetails } from '@/components/Gouvernances/GouvernanceFiltrage'
import { FilterType } from '@/components/Gouvernances/GouvernancesList'
import { GouvernanceDetails } from '@/presenters/gouvernancesPresenter'

export default function GouvernanceListFiltre({
  details,
  filterAvance,
  filtreGeographique,
  onFilter,
  onReset,
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
      <h2 className="fr-h4">
        Filtrer les gouvernances
      </h2>

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
        className="fr-fieldset  fr-mb-3w"
      >
        <legend
          className="fr-fieldset__legend fr-text--regular"
          id="radio-group-1"
        >
          Filtres avancés
        </legend>
        <div className="fr-radio-group">
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

        <div className="fr-radio-group">
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

        <div className="fr-radio-group">
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

        <div className="fr-radio-group">
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

      <div className="fr-btns-group fr-btns-group--inline-md fr-btns-group--inline-lg">
        <button
          className="fr-btn"
          onClick={() => { onFilter(geographique, avance) }}
          type="button"
        >
          Afficher les
          {' '}
          {totalResults}
          {' '}
          résultats
        </button>
        <button
          className="fr-btn fr-btn--secondary"
          onClick={onReset}
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
  filterAvance: FilterType
  filtreGeographique: string
  onFilter(filtreGeographique: string, filterAvance: FilterType): void
  onReset(): void
}>
