// Stryker disable all
import { ReactElement } from 'react'
import Select, { StylesConfig } from 'react-select'
import AsyncSelect from 'react-select/async'

export default function OrganisationInput({
  label,
  options,
  organisation,
  setOrganisation,
}: OrganisationInputProps): ReactElement {
  const onSearch = async (search: string): Promise<ReadonlyArray<{label: string, value: string}>> => {
    if (search.length < 3) {
      return []
    }
    const result = await fetch(`/api/structures?search=${search}`)
    const structures = await result.json() as ReadonlyArray<{ uid: string, nom: string }>
    return structures.map(({ uid, nom }) => ({ label: nom, value: uid }))
  }

  return (
    <div className="fr-select-group">
      <label
        className="fr-label"
        htmlFor="organisation"
      >
        {label}
        {' '}
        <span className="color-red">
          *
        </span>
      </label>
      {label === 'Structure' ?
        <AsyncSelect
          cacheOptions={true}
          components={{ DropdownIndicator }}
          inputId="organisation"
          instanceId="organisation"
          isClearable={true}
          loadOptions={onSearch}
          loadingMessage={() => 'Chargement des structures...'}
          menuPlacement="top"
          name="organisation"
          noOptionsMessage={() => 'Rechercher une structure'}
          onChange={setOrganisation as (organisation: unknown) => void}
          placeholder=""
          required={true}
          styles={styles}
          value={organisation}
        /> :
        <Select
          components={{ DropdownIndicator }}
          inputId="organisation"
          instanceId="organisation"
          isClearable={true}
          menuPlacement="top"
          name="organisation"
          noOptionsMessage={() => 'Pas de résultat'}
          onChange={setOrganisation as (organisation: unknown) => void}
          options={options}
          placeholder=""
          required={true}
          styles={styles}
          value={organisation}
        />}
    </div>
  )
}

type OrganisationInputProps = Readonly<{
  label: string
  options: ReadonlyArray<{value: string, label: string}>
  organisation: string
  setOrganisation: (organisation: string) => void
}>

// istanbul ignore next @preserve
const styles: StylesConfig = {
  control: (styles) => ({
    ...styles,
    backgroundColor: 'var(--background-contrast-grey)',
    border: 'none',
    borderRadius: '.25rem .25rem 0 0',
    boxShadow: 'inset 0 -2px 0 0 var(--border-plain-grey)',
    color: 'var(--text-default-grey)',
    cursor: 'pointer',
  }),
  option: (styles, { isFocused }) => ({
    ...styles,
    backgroundColor: isFocused ? '#dfdfdf' : undefined,
    borderBottom: '1px solid #ddd',
    color: '#222',
    cursor: 'pointer',
  }),
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
