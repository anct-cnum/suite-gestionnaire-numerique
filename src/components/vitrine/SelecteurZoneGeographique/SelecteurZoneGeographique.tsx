'use client'

import { ReactElement } from 'react'
import Select, { StylesConfig } from 'react-select'

import { regionsEtDepartements, ZoneGeographique } from '@/presenters/filtresUtilisateurPresenter'

export default function SelecteurZoneGeographique({ onChange }: Props): ReactElement {
  return (
    <div className="fr-select-group">
      <Select
        components={{ DropdownIndicator }}
        inputId="zoneGeographique"
        instanceId="zoneGeographique"
        isClearable={false}
        name="zoneGeographique"
        onChange={(zone) => {
          if (zone) {
            onChange(zone as ZoneGeographique)
          }
        }}
        options={regionsEtDepartements()}
        placeholder="Sélectionnez un territoire (région, département)"
        styles={styles}
      />
    </div>
  )
}

// istanbul ignore next @preserve
const styles: StylesConfig<ZoneGeographique> = {
  control: (styles) => ({
    ...styles,
    backgroundColor: 'var(--background-contrast-grey)',
    border: 'none',
    borderRadius: '.25rem .25rem 0 0',
    boxShadow: 'inset 0 -2px 0 0 var(--border-plain-grey)',
    color: 'var(--text-default-grey)',
    cursor: 'pointer',
  }),
  option: (styles, { data, isFocused, isSelected }) => {
    const colorOfFocus = isFocused ? '#dfdfdf' : undefined
    const backgroundColor = isSelected ? '#bbb' : colorOfFocus
    const borderBottom = data.type === 'region' ? '1px solid #ddd' : undefined
    const fontWeight = data.type === 'region' ? '900' : undefined

    return {
      ...styles,
      backgroundColor,
      borderBottom,
      color: '#222',
      cursor: 'pointer',
      fontWeight,
    }
  },
}

function DropdownIndicator(): ReactElement {
  return (
    <svg
      height="24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m12 13.1 5-4.9 1.4 1.4-6.4 6.3-6.4-6.4L7 8.1l5 5z" />
    </svg>
  )
}

type Props = Readonly<{
  onChange(zoneGeographique: ZoneGeographique): void
}>
