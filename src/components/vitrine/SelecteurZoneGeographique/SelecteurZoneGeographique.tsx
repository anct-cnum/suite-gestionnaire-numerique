'use client'

import { ReactElement } from 'react'

import Select from '@/components/shared/Select/Select'
import { regionsEtDepartements, ZoneGeographique } from '@/presenters/filtresUtilisateurPresenter'

export default function SelecteurZoneGeographique({ defaultValue, onChange }: Props): ReactElement {
  return (
    <Select<ZoneGeographique>
      formatOptionLabel={(option) => (
        <span className={option.type === 'region' ? 'fr-text--bold' : ''}>{option.label}</span>
      )}
      id="zoneGeographique"
      name="zoneGeographique"
      onChange={(zone) => {
        if (zone) {
          onChange(zone)
        }
      }}
      options={regionsEtDepartements()}
      placeholder="Sélectionnez un territoire (région, département)"
      value={defaultValue?.value ?? null}
    >
      <span className="fr-sr-only">Zone géographique</span>
    </Select>
  )
}

type Props = Readonly<{
  defaultValue?: ZoneGeographique
  onChange(zoneGeographique: ZoneGeographique): void
}>
