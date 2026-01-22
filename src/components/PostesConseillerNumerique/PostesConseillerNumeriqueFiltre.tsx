'use client'

import { ReactElement, useEffect, useId, useRef, useState } from 'react'
import { SelectInstance } from 'react-select'

import FiltrerParZonesGeographiques from '../MesUtilisateurs/FiltrerParZonesGeographiques'
import Checkbox from '../shared/Checkbox/Checkbox'
import Select from '../shared/Select/Select'
import { TypologieRole } from '@/domain/Role'
import { toutesLesRegions, ZoneGeographique, zoneGeographiqueToURLSearchParams } from '@/presenters/filtresUtilisateurPresenter'
import { LabelValue } from '@/presenters/shared/labels'
import { FiltresPostesConseillerNumeriqueInternes } from '@/shared/filtresPostesConseillerNumeriqueUtils'

export default function PostesConseillerNumeriqueFiltre({
  closeDrawer,
  currentFilters,
  onFilterAction,
  onResetAction,
  utilisateurRole,
}: Props): ReactElement {
  const ref = useRef<SelectInstance>(null)
  const [selectedZone, setSelectedZone] = useState<null | ZoneGeographique>(null)
  const [selectedStatut, setSelectedStatut] = useState<string>(currentFilters.statut)
  const [isBonificationSelected, setIsBonificationSelected] = useState<boolean>(currentFilters.bonification)
  const [selectedTypesPoste, setSelectedTypesPoste] = useState<Array<string>>(currentFilters.typesPoste)
  const [selectedConventions, setSelectedConventions] = useState<Array<string>>(currentFilters.conventions)
  const [selectedTypesEmployeur, setSelectedTypesEmployeur] = useState<Array<string>>(currentFilters.typesEmployeur)

  const statutSelectId = useId()
  const bonificationToggleId = useId()

  // Synchroniser l'état du filtre avec les filtres actuels
  useEffect(() => {
    setSelectedStatut(currentFilters.statut)
    setIsBonificationSelected(currentFilters.bonification)
    setSelectedTypesPoste(currentFilters.typesPoste)
    setSelectedConventions(currentFilters.conventions)
    setSelectedTypesEmployeur(currentFilters.typesEmployeur)
  }, [currentFilters])

  function handleZoneGeographiqueChange(zoneGeographique: ZoneGeographique): void {
    setSelectedZone(zoneGeographique)
  }

  function createCheckboxHandler(
    currentValues: Array<string>,
    setter: (values: Array<string>) => void
  ): (event: React.ChangeEvent<HTMLInputElement>, value: string) => void {
    return (event, value) => {
      const newValues = event.target.checked
        ? [...currentValues, value]
        : currentValues.filter((item) => item !== value)
      setter(newValues)
    }
  }

  function handleApplyFilters(): void {
    const params = new URLSearchParams()

    // Filtre géographique - seulement pour les administrateur_dispositif
    if (utilisateurRole === 'Administrateur dispositif') {
      applyGeographicFilter(params)
    }

    function applyGeographicFilter(urlParams: URLSearchParams): void {
      if (selectedZone === null) {
        // Préserver le filtre géographique existant si l'utilisateur ne l'a pas modifié
        if (currentFilters.codeDepartement !== null) {
          urlParams.set('codeDepartement', currentFilters.codeDepartement)
        } else if (currentFilters.codeRegion !== null) {
          urlParams.set('codeRegion', currentFilters.codeRegion)
        }
        return
      }
      // L'utilisateur a changé la zone géographique
      const geoParams = zoneGeographiqueToURLSearchParams(selectedZone)
      geoParams.forEach((value, key) => {
        if (key === 'region') {
          urlParams.set('codeRegion', value)
        } else if (key === 'departement') {
          urlParams.set('codeDepartement', value)
        }
      })
    }

    if (selectedStatut !== '') {
      params.set('statut', selectedStatut)
    }
    if (isBonificationSelected) {
      params.set('bonification', 'true')
    }
    if (selectedTypesPoste.length > 0) {
      params.set('typesPoste', selectedTypesPoste.join(','))
    }
    if (selectedConventions.length > 0) {
      params.set('conventions', selectedConventions.join(','))
    }
    if (selectedTypesEmployeur.length > 0) {
      params.set('typesEmployeur', selectedTypesEmployeur.join(','))
    }

    onFilterAction(params)
    closeDrawer()
  }

  function handleReset(): void {
    ref.current?.setValue(toutesLesRegions, 'select-option')
    setSelectedZone(null)
    setSelectedStatut('')
    setIsBonificationSelected(false)
    setSelectedTypesPoste([])
    setSelectedConventions([])
    setSelectedTypesEmployeur([])
    onResetAction()
    closeDrawer()
  }

  const statutOptions: ReadonlyArray<LabelValue> = [
    { isSelected: selectedStatut === '', label: 'Tous', value: '' },
    { isSelected: selectedStatut === 'occupe', label: 'Occupé', value: 'occupe' },
    { isSelected: selectedStatut === 'vacant', label: 'Vacant', value: 'vacant' },
    { isSelected: selectedStatut === 'rendu', label: 'Rendu', value: 'rendu' },
  ]

  const typesPosteOptions = [
    { label: 'Coordinateur', value: 'coordinateur' },
    { label: 'Conseiller numérique', value: 'conseiller' },
  ]

  const conventionsOptions = [
    { label: 'Renouvellement (V2)', value: 'V2' },
    { label: 'Initiale (V1)', value: 'V1' },
  ]

  const typesEmployeurOptions = [
    { label: 'Établissement public', value: 'public' },
    { label: 'Établissement privé', value: 'prive' },
  ]

  return (
    <div>
      {utilisateurRole === 'Administrateur dispositif' ? (
        <>
          <FiltrerParZonesGeographiques
            ref={ref}
            setZoneGeographique={handleZoneGeographiqueChange}
          />
          <hr className="fr-hr" />
        </>
      ) : null}

      <Select<string>
        id={statutSelectId}
        name="statut"
        onChange={(event) => {
          setSelectedStatut(event.target.value)
        }}
        options={statutOptions}
        placeholder="Tous"
        value={selectedStatut}
      >
        Par statut de poste
      </Select>

      <div className="fr-toggle fr-mt-2w">
        <input
          checked={isBonificationSelected}
          className="fr-toggle__input"
          id={bonificationToggleId}
          name="bonification"
          onChange={(event) => {
            setIsBonificationSelected(event.target.checked)
          }}
          type="checkbox"
        />
        <label
          className="fr-toggle__label"
          htmlFor={bonificationToggleId}
        >
          Voir uniquement les postes bonifiés
        </label>
      </div>

      <div className="fr-fieldset fr-mt-3w">
        <legend className="fr-fieldset__legend fr-text--regular">
          Par type de poste
        </legend>
        {typesPosteOptions.map(({ label, value }) => (
          <Checkbox
            id={`typePoste-${value}`}
            isSelected={selectedTypesPoste.includes(value)}
            key={value}
            label={value}
            onChange={(event) => {
              createCheckboxHandler(selectedTypesPoste, setSelectedTypesPoste)(event, value)
            }}
            value={value}
          >
            {label}
          </Checkbox>
        ))}
      </div>

      <div className="fr-fieldset fr-mt-3w">
        <legend className="fr-fieldset__legend fr-text--regular">
          Par convention
        </legend>
        {conventionsOptions.map(({ label, value }) => (
          <Checkbox
            id={`convention-${value}`}
            isSelected={selectedConventions.includes(value)}
            key={value}
            label={value}
            onChange={(event) => {
              createCheckboxHandler(selectedConventions, setSelectedConventions)(event, value)
            }}
            value={value}
          >
            {label}
          </Checkbox>
        ))}
      </div>

      <div className="fr-fieldset fr-mt-3w">
        <legend className="fr-fieldset__legend fr-text--regular">
          Par type d&apos;employeur
        </legend>
        {typesEmployeurOptions.map(({ label, value }) => (
          <Checkbox
            id={`typeEmployeur-${value}`}
            isSelected={selectedTypesEmployeur.includes(value)}
            key={value}
            label={value}
            onChange={(event) => {
              createCheckboxHandler(selectedTypesEmployeur, setSelectedTypesEmployeur)(event, value)
            }}
            value={value}
          >
            {label}
          </Checkbox>
        ))}
      </div>

      <div className="fr-btns-group fr-mt-3w">
        <button
          className="fr-btn"
          onClick={handleApplyFilters}
          type="button"
        >
          Afficher
        </button>
        <button
          className="fr-btn fr-btn--secondary"
          onClick={handleReset}
          type="button"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  )
}

type Props = Readonly<{
  closeDrawer(): void
  currentFilters: FiltresPostesConseillerNumeriqueInternes
  onFilterAction(params: URLSearchParams): void
  onResetAction(): void
  utilisateurRole: TypologieRole
}>
