'use client'

import { ReactElement, useEffect, useId, useRef, useState } from 'react'

import FiltrerParZonesGeographiques from '../MesUtilisateurs/FiltrerParZonesGeographiques'
import Checkbox from '../shared/Checkbox/Checkbox'
import { SelectInstance } from '../shared/Select/Select'
import { TypologieRole } from '@/domain/Role'
import {
  toutesLesRegions,
  ZoneGeographique,
  zoneGeographiqueToURLSearchParams,
} from '@/presenters/filtresUtilisateurPresenter'
import { FiltresLieuxInclusionInternes } from '@/shared/filtresLieuxInclusionUtils'

export default function ListeLieuxInclusionFiltre({
  closeDrawer,
  currentFilters,
  onFilterAction,
  onResetAction,
  utilisateurRole,
}: Props): ReactElement {
  const ref = useRef<SelectInstance<ZoneGeographique>>(null)
  const [selectedZone, setSelectedZone] = useState<null | ZoneGeographique>(null)
  const [isQpvSelected, setIsQpvSelected] = useState(currentFilters.qpv)
  const [isFrrSelected, setIsFrrSelected] = useState(currentFilters.frr)
  const [isHorsZonePrioritaireSelected, setIsHorsZonePrioritaireSelected] = useState(currentFilters.horsZonePrioritaire)

  const qpvCheckboxId = useId()
  const frrCheckboxId = useId()
  const horsZonePrioritaireCheckboxId = useId()

  const typologiesTerritoire = [
    {
      checked: isQpvSelected,
      id: qpvCheckboxId,
      label: 'QPV',
      name: 'qpv',
      onChange: setIsQpvSelected,
    },
    {
      checked: isFrrSelected,
      id: frrCheckboxId,
      label: 'FRR',
      name: 'frr',
      onChange: setIsFrrSelected,
    },
    {
      checked: isHorsZonePrioritaireSelected,
      id: horsZonePrioritaireCheckboxId,
      label: 'Hors zone prioritaire',
      name: 'horsZonePrioritaire',
      onChange: setIsHorsZonePrioritaireSelected,
    },
  ]

  // Synchroniser l'état du filtre avec les filtres actuels
  useEffect(() => {
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
    setIsQpvSelected(false)
    setIsFrrSelected(false)
    setIsHorsZonePrioritaireSelected(false)
    onResetAction()
    closeDrawer()
  }

  return (
    <div>
      {utilisateurRole === 'Administrateur dispositif' && (
        <>
          <FiltrerParZonesGeographiques ref={ref} setZoneGeographique={handleZoneGeographiqueChange} />
          <hr className="fr-hr" />
        </>
      )}

      <div className="fr-fieldset">
        <legend className="fr-fieldset__legend fr-text--regular">Typologie de territoire</legend>
        {typologiesTerritoire.map(({ checked, id, label, name, onChange }) => (
          <Checkbox
            id={id}
            isSelected={checked}
            key={name}
            label={name}
            onChange={(event) => {
              onChange(event.target.checked)
            }}
            value={name}
          >
            {label}
          </Checkbox>
        ))}
      </div>

      <div className="fr-btns-group fr-mt-3w">
        <button className="fr-btn" onClick={handleApplyFilters} type="button">
          Afficher les lieux
        </button>
        <button className="fr-btn fr-btn--secondary" onClick={handleReset} type="button">
          Réinitialiser
        </button>
      </div>
    </div>
  )
}

type Props = Readonly<{
  closeDrawer(): void
  currentFilters: FiltresLieuxInclusionInternes
  onFilterAction(params: URLSearchParams): void
  onResetAction(): void
  utilisateurRole: TypologieRole
}>
