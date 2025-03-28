// Stryker disable all
import { ReactElement } from 'react'
import Select, { Options, StylesConfig } from 'react-select'
import AsyncSelect from 'react-select/async'

import { makeSearchParams, StructureSearchViewModel, toStructureSearchViewModels } from '@/presenters/rechercheStructuresPresenter'

export default function OrganisationInput({
  extraSearchParams,
  label,
  options,
  organisation,
  placeholder,
  required,
  setOrganisation,
}: Props): ReactElement {
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
      {
        options.length ?
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
            placeholder={placeholder}
            required={required}
            styles={styles}
            value={organisation}
          /> :
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
            placeholder={placeholder}
            required={required}
            styles={styles}
            value={organisation}
          />
      }
    </div>
  )

  async function onSearch(search: string): Promise<Options<StructureSearchViewModel>> {
    if (search.length < 3) {
      return []
    }
    return fetch(`/api/structures?${makeSearchParams(search, extraSearchParams).toString()}`)
      .then(async (result) => result.json() as Promise<Parameters<typeof toStructureSearchViewModels>[0]>)
      .then(toStructureSearchViewModels)
  }
}

type Props = Readonly<{
  extraSearchParams?: URLSearchParams
  label: string
  options: ReadonlyArray<{
    label: string
    value: string
  }>
  organisation: string
  placeholder: string
  required: boolean
  setOrganisation(organisation: string): void
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
  input: (styles) => ({
    ...styles,
    color: 'var(--text-default-grey)',
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
