// Stryker disable all
import { ReactElement } from 'react'
import Select, { StylesConfig, Options } from 'react-select'
import AsyncSelect from 'react-select/async'

export default function OrganisationInput({
  label,
  options,
  organisation,
  setOrganisation,
  required,
  additionalSearchParams,
}: OrganisationInputProps): ReactElement {
  const additionalSearchParamEntries = (additionalSearchParams ?? new URLSearchParams()).entries()

  return (
    <div className="fr-select-group">
      <label
        className="fr-label"
        htmlFor="organisation"
      >
        {label}
        {required ?
          <>
            {' '}
            <span className="color-red">
              *
            </span>
          </> :
          null}
      </label>
      {!options.length ?
        <AsyncSelect
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
          required={required}
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
          required={required}
          styles={styles}
          value={organisation}
        />}
    </div>
  )

  async function onSearch(search: string): Promise<Options<{label: string, value: string}>> {
    if (search.length < 3) {
      return []
    }
    const searchParams = new URLSearchParams([['search', search]])
    for (const [searchParamKey, searchParamValue] of additionalSearchParamEntries) {
      searchParams.append(searchParamKey, searchParamValue)
    }
    const result = await fetch(`/api/structures?${searchParams.toString()}`)
    const structures = await result.json() as ReadonlyArray<{ uid: string, nom: string }>
    return structures.map(({ uid, nom }) => ({ label: nom, value: uid }))
  }
}

type OrganisationInputProps = Readonly<{
  label: string
  options: ReadonlyArray<{value: string, label: string}>
  organisation: string
  setOrganisation: (organisation: string) => void
  required: boolean
  additionalSearchParams?: URLSearchParams
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
