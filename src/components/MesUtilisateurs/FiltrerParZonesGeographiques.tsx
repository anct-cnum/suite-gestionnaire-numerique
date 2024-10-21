'use client'

import { forwardRef, ReactElement, Ref, useContext } from 'react'
import Select, { SelectInstance, StylesConfig } from 'react-select'

import departements from '../../../ressources/departements.json'
import regions from '../../../ressources/regions.json'
import { clientContext } from '../shared/ClientContext'

export default forwardRef(function FiltrerParZonesGeographiques(
  { toutesLesRegions }: FiltrerParZonesGeographiquesProps,
  ref: Ref<SelectInstance>
): ReactElement {
  const { searchParams } = useContext(clientContext)
  const zonesGeographiques = [toutesLesRegions]

  regions.forEach((region) => {
    zonesGeographiques.push({ label: `(${region.code}) ${region.nom}`, type: 'region', value: `${region.code}_00` })

    departements
      .filter((departement) => departement.regionCode === region.code)
      .forEach((departement) => {
        zonesGeographiques.push({ label: `(${departement.code}) ${departement.nom}`, type: 'departement', value: `${region.code}_${departement.code}` })
      })
  })

  const zoneGeographiqueParDefaut =
    zonesGeographiques.find(
      (zoneGeographique) =>
        zoneGeographique.value.slice(0, 2) === searchParams.get('codeRegion')
        || zoneGeographique.value.slice(zoneGeographique.value.indexOf('_') + 1) === searchParams.get('codeDepartement')
    ) ?? toutesLesRegions

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
        defaultValue={zoneGeographiqueParDefaut}
        inputId="zoneGeographique"
        instanceId="zoneGeographique"
        isClearable={true}
        name="zoneGeographique"
        options={zonesGeographiques}
        placeholder=""
        ref={ref}
        // @ts-expect-error
        styles={styles}
      />
    </div>
  )
})

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
    const backgroundColor = isSelected ? '#bbb' : isFocused ? '#dfdfdf' : undefined
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

type FiltrerParZonesGeographiquesProps = Readonly<{
  toutesLesRegions: ZoneGeographique
}>

export type ZoneGeographique = Readonly<{
  label: string
  type: 'region' | 'departement'
  value: string
}>
