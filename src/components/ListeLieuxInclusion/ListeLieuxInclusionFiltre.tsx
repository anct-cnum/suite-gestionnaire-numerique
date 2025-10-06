'use client'

import { ReactElement, useEffect, useId, useRef, useState } from 'react'
import { SelectInstance } from 'react-select'

import FiltrerParZonesGeographiques from '../MesUtilisateurs/FiltrerParZonesGeographiques'
import Select from '../shared/Select/Select'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { TypologieRole } from '@/domain/Role'
import { toutesLesRegions, ZoneGeographique, zoneGeographiqueToURLSearchParams } from '@/presenters/filtresUtilisateurPresenter'
import { LabelValue } from '@/presenters/shared/labels'
import { FiltresLieuxInclusionInternes } from '@/shared/filtresLieuxInclusionUtils'

export default function ListeLieuxInclusionFiltre({
  closeDrawer,
  currentFilters,
  labelId,
  onFilterAction,
  onResetAction,
  typesStructure,
  utilisateurRole,
}: Props): ReactElement {
  const ref = useRef<SelectInstance>(null)
  const [selectedZone, setSelectedZone] = useState<null | ZoneGeographique>(null)
  const [selectedStructureType, setSelectedStructureType] = useState<string>(currentFilters.typeStructure)
  const [isQpvSelected, setIsQpvSelected] = useState<boolean>(currentFilters.qpv)
  const [isFrrSelected, setIsFrrSelected] = useState<boolean>(currentFilters.frr)
  const [isHorsZonePrioritaireSelected, setIsHorsZonePrioritaireSelected] =
    useState<boolean>(currentFilters.horsZonePrioritaire)

  const structureTypeSelectId = useId()
  const qpvCheckboxId = useId()
  const frrCheckboxId = useId()
  const horsZonePrioritaireCheckboxId = useId()

  // Synchroniser l'état du filtre avec les filtres actuels
  useEffect(() => {
    setSelectedStructureType(currentFilters.typeStructure)
    setIsQpvSelected(currentFilters.qpv)
    setIsFrrSelected(currentFilters.frr)
    setIsHorsZonePrioritaireSelected(currentFilters.horsZonePrioritaire)
  }, [currentFilters])

  function handleZoneGeographiqueChange(zoneGeographique: ZoneGeographique): void {
    setSelectedZone(zoneGeographique)
  }

  function handleApplyFilters(): void {
    const params = new URLSearchParams()

    // Filtre géographique - seulement pour les administrateur_dispositif
    if (utilisateurRole === 'Administrateur dispositif' && selectedZone) {
      const geoParams = zoneGeographiqueToURLSearchParams(selectedZone)
      geoParams.forEach((value, key) => {
        // Adapter les clés pour correspondre à notre système
        if (key === 'region') {
          params.set('codeRegion', value)
        } else if (key === 'departement') {
          params.set('codeDepartement', value)
        }
      })
    }

    if (selectedStructureType !== '') {
      params.set('typeStructure', selectedStructureType)
    }
    if (isQpvSelected) {
      params.set('qpv', 'true')
    }
    if (isFrrSelected) {
      params.set('frr', 'true')
    }
    if (isHorsZonePrioritaireSelected) {
      params.set('horsZonePrioritaire', 'true')
    }

    onFilterAction(params)
    closeDrawer()
  }

  function handleReset(): void {
    ref.current?.setValue(toutesLesRegions, 'select-option')
    setSelectedZone(null)
    setSelectedStructureType('')
    setIsQpvSelected(false)
    setIsFrrSelected(false)
    setIsHorsZonePrioritaireSelected(false)
    onResetAction()
    closeDrawer()
  }

  const typesStructureOptions: ReadonlyArray<LabelValue> = [
    { isSelected: selectedStructureType === '', label: 'Tous les types', value: '' },
    ...typesStructure.map(type => ({
      isSelected: selectedStructureType === type.code,
      label: type.nom,
      value: type.code,
    })),
  ]

  return (
    <div className="fr-modal__content">
      <h1
        className="fr-modal__title"
        id={labelId}
      >
        <TitleIcon icon="filter-line" />
        Filtrer les lieux
      </h1>
      <div className="fr-p-2w">
        {utilisateurRole ===  'Administrateur dispositif' && (
          <>
            <FiltrerParZonesGeographiques
              ref={ref}
              setZoneGeographique={handleZoneGeographiqueChange}
            />

            <hr className="fr-hr" />
          </>
        )}

        <Select<string>
          id={structureTypeSelectId}
          name="typeStructure"
          onChange={(event) => { setSelectedStructureType(event.target.value) }}
          options={typesStructureOptions}
          placeholder="Choisir un type"
        >
          Par typologie de structure
        </Select>

        <div className="fr-fieldset">
          <legend className="fr-fieldset__legend fr-text--regular">
            Typologie de territoire
          </legend>
          <div className="fr-fieldset__content">
            <div className="fr-checkbox-group">
              <input
                checked={isQpvSelected}
                id={qpvCheckboxId}
                name="qpv"
                onChange={(event) => { setIsQpvSelected(event.target.checked) }}
                type="checkbox"
                value="qpv"
              />
              <label
                className="fr-label"
                htmlFor={qpvCheckboxId}
              >
                QPV
              </label>
            </div>
            <div className="fr-checkbox-group">
              <input
                checked={isFrrSelected}
                id={frrCheckboxId}
                name="frr"
                onChange={(event) => { setIsFrrSelected(event.target.checked) }}
                type="checkbox"
                value="frr"
              />
              <label
                className="fr-label"
                htmlFor={frrCheckboxId}
              >
                FRR
              </label>
            </div>
            <div className="fr-checkbox-group">
              <input
                checked={isHorsZonePrioritaireSelected}
                id={horsZonePrioritaireCheckboxId}
                name="horsZonePrioritaire"
                onChange={(event) => { setIsHorsZonePrioritaireSelected(event.target.checked) }}
                type="checkbox"
                value="horsZonePrioritaire"
              />
              <label
                className="fr-label"
                htmlFor={horsZonePrioritaireCheckboxId}
              >
                Hors zone prioritaire
              </label>
            </div>
          </div>
        </div>

        <div className="fr-btns-group fr-mt-3w">
          <button
            className="fr-btn"
            onClick={handleApplyFilters}
            type="button"
          >
            Afficher les lieux
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
    </div>
  )
}

type Props = Readonly<{
  closeDrawer(): void
  currentFilters: FiltresLieuxInclusionInternes
  labelId: string
  onFilterAction(params: URLSearchParams): void
  onResetAction(): void
  typesStructure: Array<{ code: string; nom: string }>
  utilisateurRole: TypologieRole
}>
