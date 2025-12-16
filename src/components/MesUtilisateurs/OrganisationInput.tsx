// Stryker disable all
import { ReactElement } from 'react'
import Select, { Options, StylesConfig } from 'react-select'
import AsyncSelect from 'react-select/async'

import { makeSearchParams, toStructureSearchViewModels } from '@/presenters/rechercheStructuresPresenter'

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
          <Select<OrganisationOption>
            components={{ DropdownIndicator }}
            formatOptionLabel={formatOptionLabel}
            inputId="organisation"
            instanceId="organisation"
            isClearable={true}
            menuPlacement="top"
            name="organisation"
            noOptionsMessage={() => 'Pas de résultat'}
            onChange={setOrganisation}
            options={options}
            placeholder={placeholder}
            required={required}
            styles={styles}
            value={organisation}
          /> :
          <AsyncSelect<OrganisationOption>
            components={{ DropdownIndicator }}
            formatOptionLabel={formatOptionLabel}
            inputId="organisation"
            instanceId="organisation"
            isClearable={true}
            loadOptions={onSearch}
            loadingMessage={() => 'Chargement des structures...'}
            menuPlacement="top"
            name="organisation"
            noOptionsMessage={() => 'Rechercher une structure'}
            onChange={setOrganisation}
            placeholder={placeholder}
            required={required}
            styles={styles}
            value={organisation}
          />
      }
    </div>
  )

  async function onSearch(search: string): Promise<Options<OrganisationOption>> {
    if (search.length < 3) {
      return []
    }
    return fetch(`/api/structures?${makeSearchParams(search, extraSearchParams).toString()}`)
      .then(async (result) => result.json() as Promise<Parameters<typeof toStructureSearchViewModels>[0]>)
      .then(toStructureSearchViewModels)
  }
}

export type OrganisationOption = Readonly<{
  isMembre?: boolean
  label: string
  value: string
}>

type Props = Readonly<{
  extraSearchParams?: URLSearchParams
  label: string
  options: ReadonlyArray<OrganisationOption>
  organisation: null | OrganisationOption
  placeholder: string
  required: boolean
  setOrganisation(organisation: null | OrganisationOption): void
}>

// istanbul ignore next @preserve
const styles: StylesConfig<OrganisationOption> = {
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

function formatOptionLabel(option: OrganisationOption): ReactElement {
  return (
    <span style={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
      {option.isMembre === true ?
        <span
          aria-label="Membre de la gouvernance"
          className="fr-icon-team-line"
          role="img"
          style={{ color: 'var(--text-default-info)' }}
          title="Membre de la gouvernance"
        /> :
        <span
          aria-label="Structure"
          className="fr-icon-building-line"
          role="img"
          style={{ color: 'var(--text-mention-grey)' }}
          title="Structure"
        />}
      <span>
        {option.label}
      </span>
    </span>
  )
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
