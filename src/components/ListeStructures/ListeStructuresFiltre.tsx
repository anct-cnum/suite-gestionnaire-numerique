'use client'

import { ReactElement, useEffect, useId, useState } from 'react'

import FiltrerParZonesGeographiques from '../MesUtilisateurs/FiltrerParZonesGeographiques'
import Select from '../shared/Select/Select'
import { cleGeographiqueParType, territoireDepuisCodes } from '@/presenters/rechercheTerritoiresPresenter'
import { LabelValue } from '@/presenters/shared/labels'

export default function ListeStructuresFiltre({
  closeDrawer,
  currentFilters,
  estScopeNational,
  id,
  libelleTerritoireRestreint,
  onFilterAction,
  onResetAction,
}: Props): ReactElement {
  const selectLabellisationId = useId()
  const [selectedZone, setSelectedZone] = useState(territoireDepuisCodes(currentFilters))
  const [cleReinitialisation, setCleReinitialisation] = useState(0)
  const [selectedLabellisation, setSelectedLabellisation] = useState('')

  // Synchroniser l'état du filtre avec les filtres actuels
  useEffect(() => {
    setSelectedZone(territoireDepuisCodes(currentFilters))
    setSelectedLabellisation(currentFilters.labellisation ?? '')
  }, [currentFilters])

  function reinitialiser(): void {
    setCleReinitialisation((cle) => cle + 1)
    setSelectedZone(null)
    setSelectedLabellisation('')
    onResetAction()
    closeDrawer()
  }

  function appliquerFiltre(): void {
    const params = new URLSearchParams()

    // Filtre géographique - réservé au scope national
    if (estScopeNational && selectedZone) {
      params.set(cleGeographiqueParType[selectedZone.type], selectedZone.code)
    }

    if (selectedLabellisation !== '') {
      params.set('labellisation', selectedLabellisation)
    }

    onFilterAction(params)
    closeDrawer()
  }

  return (
    <div className="sidepanel__content">
      {estScopeNational ? (
        <>
          <FiltrerParZonesGeographiques
            key={cleReinitialisation}
            onSelectionner={setSelectedZone}
            valeurInitiale={selectedZone}
          />
          <hr className="fr-hr" />
        </>
      ) : null}
      {!estScopeNational && libelleTerritoireRestreint !== '' ? (
        <p className="fr-text--sm fr-mb-3w">Recherche limitée à votre département : {libelleTerritoireRestreint}</p>
      ) : null}

      <Select<LabelValue>
        id={selectLabellisationId}
        name="labellisation"
        onChange={(option) => {
          setSelectedLabellisation(option === null ? '' : option.value)
        }}
        options={optionsLabellisation}
        value={selectedLabellisation}
      >
        Par Labellisation / Habilitation
      </Select>

      <div className="fr-btns-group fr-mt-3w">
        <button aria-controls={id} className="fr-btn" onClick={appliquerFiltre} type="button">
          Afficher les structures
        </button>
        <button className="fr-btn fr-btn--secondary" onClick={reinitialiser} type="button">
          Réinitialiser
        </button>
      </div>
    </div>
  )
}

const optionsLabellisation: ReadonlyArray<LabelValue> = [
  { label: 'Toutes', value: '' },
  { label: 'Conseiller Numérique', value: 'conseiller-numerique' },
  { label: 'Aidants Connect', value: 'aidants-connect' },
]

type Props = Readonly<{
  closeDrawer(): void
  currentFilters: Readonly<{
    codeDepartement: null | string
    codeEpci: null | string
    codeRegion: null | string
    labellisation: null | string
  }>
  estScopeNational: boolean
  id: string
  libelleTerritoireRestreint: string
  onFilterAction(params: URLSearchParams): void
  onResetAction(): void
}>
