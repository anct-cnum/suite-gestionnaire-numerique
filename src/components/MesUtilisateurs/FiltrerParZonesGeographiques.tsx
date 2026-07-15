// Stryker disable all
'use client'

import { ReactElement, Ref, useContext } from 'react'

import { clientContext } from '../shared/ClientContext'
import Select, { SelectInstance } from '@/components/shared/Select/Select'
import {
  regionsEtDepartements,
  ZoneGeographique,
  zoneGeographiqueParDefaut,
} from '@/presenters/filtresUtilisateurPresenter'

export default function FiltrerParZonesGeographiques({ ref, setZoneGeographique }: Props): ReactElement {
  const { searchParams } = useContext(clientContext)
  const defaut = zoneGeographiqueParDefaut(searchParams.get('codeRegion'), searchParams.get('codeDepartement'))
  const options = regionsEtDepartements().map((zone) => ({
    ...zone,
    isSelected: zone.value === defaut.value,
  }))

  return (
    <Select<ZoneGeographique>
      formatOptionLabel={(option) => (
        <span className={option.type === 'region' ? 'fr-text--bold' : ''}>{option.label}</span>
      )}
      id="zoneGeographique"
      isClearable={true}
      name="zoneGeographique"
      onChange={(zone) => {
        if (zone !== null) {
          setZoneGeographique(zone)
        }
      }}
      options={options}
      placeholder=""
      ref={ref}
    >
      Par zone géographique
    </Select>
  )
}

type Props = Readonly<{
  ref: Ref<SelectInstance<ZoneGeographique>>
  setZoneGeographique(zoneGeographique: ZoneGeographique): void
}>
