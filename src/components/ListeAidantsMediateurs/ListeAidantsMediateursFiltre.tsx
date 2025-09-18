'use client'

import { ReactElement, useRef, useState } from 'react'
import { SelectInstance } from 'react-select'

import FiltrerParZonesGeographiques from '../MesUtilisateurs/FiltrerParZonesGeographiques'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import { toutesLesRegions, ZoneGeographique, zoneGeographiqueToURLSearchParams } from '@/presenters/filtresUtilisateurPresenter'

export default function ListeAidantsMediateursFiltre({
  closeDrawer,
  id,
  labelId,
  onFilterAction,
  onResetAction,
}: Props): ReactElement {
  const ref = useRef<SelectInstance>(null)
  const [selectedZone, setSelectedZone] = useState<null | ZoneGeographique>(null)

  function handleZoneGeographiqueChange(zoneGeographique: ZoneGeographique): void {
    setSelectedZone(zoneGeographique)
  }

  function reinitialiser(): void {
    ref.current?.setValue(toutesLesRegions, 'select-option')
    setSelectedZone(null)
    onResetAction()
    closeDrawer()
  }

  function appliquerFiltre(): void {
    if (selectedZone) {
      const params = zoneGeographiqueToURLSearchParams(selectedZone)
      onFilterAction(params)
    }
    closeDrawer()
  }

  return (
    <>
      <DrawerTitle id={labelId}>
        Filtrer les aidants et médiateurs
      </DrawerTitle>
      <div className="sidepanel__content">
        <FiltrerParZonesGeographiques
          ref={ref}
          setZoneGeographique={handleZoneGeographiqueChange}
        />

        <div className="fr-btns-group fr-btns-group--space-between fr-mt-3w">
          <button
            className="fr-btn fr-btn--secondary fr-col-5"
            onClick={reinitialiser}
            type="button"
          >
            Réinitialiser
          </button>
          <button
            aria-controls={id}
            className="fr-btn fr-col-5"
            onClick={appliquerFiltre}
            type="button"
          >
            Appliquer
          </button>
        </div>
      </div>
    </>
  )
}

type Props = Readonly<{
  closeDrawer(): void
  id: string
  labelId: string
  onFilterAction(params: URLSearchParams): void
  onResetAction(): void
}>