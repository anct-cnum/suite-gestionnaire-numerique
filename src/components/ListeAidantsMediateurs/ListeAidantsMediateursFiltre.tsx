'use client'

import { ReactElement, useRef, useState } from 'react'
import { SelectInstance } from 'react-select'

import FiltrerParZonesGeographiques from '../MesUtilisateurs/FiltrerParZonesGeographiques'
import CheckboxGroup from '../shared/CheckboxGroup/CheckboxGroup'
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
  const [selectedRoles, setSelectedRoles] = useState<Array<string>>([])
  const [selectedHabilitations, setSelectedHabilitations] = useState<Array<string>>([])
  const [selectedFormations, setSelectedFormations] = useState<Array<string>>([])

  function handleZoneGeographiqueChange(zoneGeographique: ZoneGeographique): void {
    setSelectedZone(zoneGeographique)
  }

  function reinitialiser(): void {
    ref.current?.setValue(toutesLesRegions, 'select-option')
    setSelectedZone(null)
    setSelectedRoles([])
    setSelectedHabilitations([])
    setSelectedFormations([])
    onResetAction()
    closeDrawer()
  }

  function appliquerFiltre(): void {
    const params = new URLSearchParams()

    // Filtre géographique
    if (selectedZone) {
      const geoParams = zoneGeographiqueToURLSearchParams(selectedZone)
      geoParams.forEach((value, key) => {
        params.set(key, value)
      })
    }

    // Filtres rôles
    if (selectedRoles.length > 0) {
      params.set('roles', selectedRoles.join(','))
    }

    // Filtres habilitations
    if (selectedHabilitations.length > 0) {
      params.set('habilitations', selectedHabilitations.join(','))
    }

    // Filtres formations
    if (selectedFormations.length > 0) {
      params.set('formations', selectedFormations.join(','))
    }

    onFilterAction(params)
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

        <hr className="fr-hr" />

        <CheckboxGroup
          legend="Par rôle"
          name="roles"
          onChange={setSelectedRoles}
          options={[
            { label: 'Médiateur', value: 'Médiateur' },
            { label: 'Coordinateur', value: 'Coordinateur' },
            { label: 'Aidant', value: 'Aidant' },
          ]}
          selectedValues={selectedRoles}
        />

        <CheckboxGroup
          legend="Par habilitation/labellisation"
          name="habilitations"
          onChange={setSelectedHabilitations}
          options={[
            { label: 'Conseiller numérique', value: 'Conseiller numérique' },
            { label: 'Aidants Connect', value: 'Aidants Connect' },
          ]}
          selectedValues={selectedHabilitations}
        />

        <CheckboxGroup
          legend="Par formation"
          name="formations"
          onChange={setSelectedFormations}
          options={[
            { label: 'PIX', value: 'PIX' },
            { label: 'REMN', value: 'REMN' },
            { label: 'CCP2 et CCP3', value: 'CCP2 et CCP3' },
            { label: 'CCP1', value: 'CCP1' },
          ]}
          selectedValues={selectedFormations}
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