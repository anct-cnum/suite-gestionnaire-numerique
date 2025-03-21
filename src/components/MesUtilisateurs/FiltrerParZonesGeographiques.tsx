// Stryker disable all
'use client'

import { ReactElement, Ref, useContext } from 'react'
import Select, { SelectInstance, StylesConfig } from 'react-select'

import { clientContext } from '../shared/ClientContext'
import { regionsEtDepartements, ZoneGeographique, zoneGeographiqueParDefaut } from '@/presenters/filtresUtilisateurPresenter'
import { isNullish } from '@/shared/lang'

export default function FiltrerParZonesGeographiques(
  { ref, setZoneGeographique }: Props
): ReactElement {
  const { searchParams } = useContext(clientContext)

  return (
    <div className="fr-select-group">
      <label
        className="fr-label"
        htmlFor="zoneGeographique"
      >
        Par zone géographique
      </label>
      <Select
        components={{ DropdownIndicator }}
        defaultValue={zoneGeographiqueParDefaut(searchParams.get('codeRegion'), searchParams.get('codeDepartement'))}
        inputId="zoneGeographique"
        instanceId="zoneGeographique"
        isClearable={true}
        name="zoneGeographique"
        onChange={(zone) => {
          setZone(zone as ZoneGeographique)
        }}
        options={regionsEtDepartements()}
        placeholder=""
        ref={ref}
        // @ts-expect-error
        styles={styles}
      />
    </div>
  )

  function setZone(zoneGeographique?: ZoneGeographique): void {
    if (!isNullish(zoneGeographique)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setZoneGeographique(zoneGeographique!)
    }
  }
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
  ref: Ref<SelectInstance>
  setZoneGeographique(zoneGeographique: ZoneGeographique): void
}>
